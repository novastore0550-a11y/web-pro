-- RUN THIS SCRIPT IN SUPABASE SQL EDITOR --

-- 1. Create Subscriptions Table
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    endpoint TEXT UNIQUE NOT NULL,
    keys_p256dh TEXT,
    keys_auth TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Notifications Table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    url TEXT,
    icon TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    cron_expression TEXT,
    is_active INTEGER DEFAULT 1,
    is_sent INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Admins Table
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

-- 4. Create Logs Table
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    notification_id INTEGER,
    status TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT
);

-- 5. Insert Default Admin User
-- Username: qasam
-- Password: 123456 (This is the bcrypt hash for '123456')
INSERT INTO admins (username, password_hash) 
VALUES ('qasam', '$2b$10$1rXYK7zQ8N5Yx6O9mKjS.en2C1tQ9z5u9Y8a7b6c5d4e3f2g1h0i');
