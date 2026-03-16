require('dotenv').config();
const express = require('express');
const path = require('path');
const webpush = require('web-push');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cronParser = require('cron-parser');
const db = require('../src/db');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_qasam_key_2026';

// Fallback VAPID keys for development if not in .env. 
const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY || "BNoYv3kX15I6eN2L3-P39a6Wl7aN-K46mGzX8U7T1K_qM6rZ3R2x799uL-i5oZkZ8pT_iOQGq2X8K-2KkQe7w4E",
    privateKey: process.env.VAPID_PRIVATE_KEY || "Wz9_ZzO8U7T1K_qM6rZ3R2x799uL-i5oZkZ8pT_iOQGq"
};

webpush.setVapidDetails(
    'mailto:admin@fornada.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// === Middleware ===
function authenticateToken(req, res, next) {
    const token = req.cookies.adminToken;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Forbidden" });
        req.user = user;
        next();
    });
}

// === Public APIs ===
app.get('/api/vapidPublicKey', (req, res) => {
    res.json({ publicKey: vapidKeys.publicKey });
});

app.post('/api/subscribe', async (req, res) => {
    const sub = req.body;
    try {
        await db.query(
            `INSERT INTO subscriptions (endpoint, keys_p256dh, keys_auth) 
             VALUES ($1, $2, $3) 
             ON CONFLICT (endpoint) DO NOTHING`,
            [sub.endpoint, sub.keys.p256dh, sub.keys.auth]
        );
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// === Admin APIs ===

app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await db.query(`SELECT * FROM admins WHERE username = $1`, [username]);
        const admin = result.rows[0];
        
        if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
        
        const match = await bcrypt.compare(password, admin.password_hash);
        if (match) {
            const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
            res.cookie('adminToken', token, { httpOnly: true, secure: true, sameSite: 'strict' });
            res.json({ success: true });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/logout', (req, res) => {
    res.clearCookie('adminToken');
    res.json({ success: true });
});

app.get('/api/admin/check', authenticateToken, (req, res) => {
    res.json({ success: true, user: { username: req.user.username } });
});

// Manage Notifications
app.get('/api/admin/notifications', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(`SELECT * FROM notifications ORDER BY created_at DESC`);
        res.json(result.rows || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/notifications', authenticateToken, async (req, res) => {
    const { title, message, url, icon, scheduled_at, cron_expression } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO notifications (title, message, url, icon, scheduled_at, cron_expression) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [title, message, url, icon, scheduled_at || null, cron_expression || null]
        );
        res.json({ success: true, id: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/notifications/:id', authenticateToken, async (req, res) => {
    try {
        await db.query(`DELETE FROM notifications WHERE id = $1`, [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/notifications/:id/toggle', authenticateToken, async (req, res) => {
    const { is_active } = req.body;
    try {
        await db.query(`UPDATE notifications SET is_active = $1 WHERE id = $2`, [is_active === 1 || is_active === true ? 1 : 0, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Logs & Stats
app.get('/api/admin/logs', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(`SELECT * FROM logs ORDER BY sent_at DESC LIMIT 100`);
        res.json(result.rows || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/stats', authenticateToken, async (req, res) => {
    try {
        const subRes = await db.query('SELECT COUNT(*) as count FROM subscriptions');
        const notifRes = await db.query('SELECT COUNT(*) as count FROM notifications');
        res.json({
            subscriptions: parseInt(subRes.rows[0].count) || 0,
            notifications: parseInt(notifRes.rows[0].count) || 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// === Push Sending Logic ===

async function sendPushToAll(notif) {
    try {
        const subRes = await db.query(`SELECT * FROM subscriptions`);
        const subs = subRes.rows;
        if (!subs || subs.length === 0) return;
        
        const payload = JSON.stringify({
            title: notif.title,
            body: notif.message,
            icon: notif.icon || '/images/icon-192.png',
            data: { url: notif.url || '/' }
        });

        let successCount = 0;
        let failCount = 0;

        for (const sub of subs) {
            const pushSub = {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth }
            };

            try {
                await webpush.sendNotification(pushSub, payload);
                successCount++;
            } catch (error) {
                failCount++;
                if (error.statusCode === 410 || error.statusCode === 404) {
                    await db.query(`DELETE FROM subscriptions WHERE id = $1`, [sub.id]);
                }
            }
        }
        
        await db.query(`INSERT INTO logs (notification_id, status, error_message) VALUES ($1, $2, $3)`,
            [notif.id, `Sent: ${successCount}, Failed: ${failCount}`, '']);
            
        // If it was a one-time scheduled event, mark as inactive and sent
        if (notif.scheduled_at && !notif.cron_expression) {
            await db.query(`UPDATE notifications SET is_sent = 1, is_active = 0 WHERE id = $1`, [notif.id]);
        }
    } catch (err) {
        console.error("Push Error: ", err);
    }
}

// Send Immediate Route
app.post('/api/admin/notifications/:id/send', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(`SELECT * FROM notifications WHERE id = $1`, [req.params.id]);
        const notif = result.rows[0];
        if (!notif) return res.status(404).json({ error: 'Not found' });
        
        // Execute background send (do not await, reply immediately)
        sendPushToAll(notif);
        
        res.json({ success: true, message: "Push sent to all subscribers." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// === Vercel Cron Endpoint ===
// This endpoint is hit every minute by Vercel Cron (configured in vercel.json)
app.get('/api/cron/process', async (req, res) => {
    // Basic protection using Vercel CRON system (or manually via header)
    const authHeader = req.headers.authorization;
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: "Unauthorized cron request" });
    }

    try {
        const now = new Date();
        const result = await db.query(`SELECT * FROM notifications WHERE is_active = 1`);
        const activeNotifs = result.rows;

        for (const notif of activeNotifs) {
            let shouldSend = false;

            // Scenario 1: One-time Specific Date
            if (notif.scheduled_at && notif.is_sent === 0 && !notif.cron_expression) {
                const schedTime = new Date(notif.scheduled_at);
                if (now >= schedTime) {
                    shouldSend = true;
                }
            } 
            // Scenario 2: Recurring Cron Expression
            else if (notif.cron_expression) {
                try {
                    const interval = cronParser.parseExpression(notif.cron_expression, {
                        currentDate: now,
                        tz: 'UTC' // Optional: Change to desired timezone
                    });
                    
                    // Check if current minute matches the cron expression
                    // We check if the previous interval is within the last 60 seconds
                    const prev = interval.prev().getTime();
                    const diff = now.getTime() - prev;
                    if (diff >= 0 && diff < 60000) {
                        shouldSend = true;
                    }
                } catch (e) {
                    console.error('Invalid cron expression for notif', notif.id, e.message);
                }
            }

            if (shouldSend) {
                sendPushToAll(notif); // Execute in background
            }
        }
        res.json({ success: true, checked: activeNotifs.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;
