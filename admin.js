document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    // Setup Modals/Forms
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    const createForm = document.getElementById('createNotifForm');
    if (createForm) createForm.addEventListener('submit', handleCreateNotif);

    // Schedule Radio Buttons Toggle
    const schedRadios = document.getElementsByName('scheduleType');
    schedRadios.forEach(r => r.addEventListener('change', (e) => {
        const val = e.target.value;
        const container = document.getElementById('scheduleInputs');
        const dateGroup = document.getElementById('dateInputGroup');
        const cronGroup = document.getElementById('cronInputGroup');

        if (val === 'now') {
            container.style.display = 'none';
        } else {
            container.style.display = 'block';
            if (val === 'date') {
                dateGroup.style.display = 'block';
                cronGroup.style.display = 'none';
            } else {
                dateGroup.style.display = 'none';
                cronGroup.style.display = 'block';
            }
        }
    }));
});

// --- Auth --- //
async function checkAuth() {
    try {
        const res = await fetch('/api/admin/check');
        const data = await res.json();
        
        if (data.success) {
            document.getElementById('adminLoginScreen').classList.remove('active');
            document.getElementById('adminDashboardScreen').classList.add('active');
            document.getElementById('adminName').textContent = `أهلاً ${data.user.username} 👋`;
            fetchDashboardData();
        } else {
            showLogin();
        }
    } catch (e) {
        showLogin();
    }
}

function showLogin() {
    document.getElementById('adminDashboardScreen').classList.remove('active');
    document.getElementById('adminLoginScreen').classList.add('active');
}

async function handleLogin(e) {
    e.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    const errEl = document.getElementById('loginError');
    
    try {
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: u, password: p })
        });
        const data = await res.json();
        if (data.success) {
            errEl.textContent = '';
            checkAuth();
        } else {
            errEl.textContent = 'بيانات الدخول غير صحيحة';
        }
    } catch (e) {
        errEl.textContent = 'حدث خطأ في الاتصال';
    }
}

async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.reload();
}

// --- Data Fetching --- //
async function fetchDashboardData() {
    fetchStats();
    fetchNotifications();
    fetchLogs();
}

async function fetchStats() {
    const res = await fetch('/api/admin/stats');
    const data = await res.json();
    document.getElementById('subCount').textContent = data.subscriptions || 0;
    document.getElementById('notifCount').textContent = data.notifications || 0;
}

async function fetchNotifications() {
    const res = await fetch('/api/admin/notifications');
    const data = await res.json();
    const tbody = document.getElementById('notifTableBody');
    tbody.innerHTML = '';

    data.forEach(n => {
        let schedText = 'فوري';
        if (n.scheduled_at) schedText = new Date(n.scheduled_at).toLocaleString('ar-EG');
        if (n.cron_expression) schedText = `كرون: ${n.cron_expression}`;

        let statusHtml = '';
        if (n.is_sent) {
            statusHtml = `<span class="badge sent">مُرسل</span>`;
        } else if (n.is_active) {
            statusHtml = `<span class="badge active">نشط</span>`;
        } else {
            statusHtml = `<span class="badge inactive">متوقف</span>`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${n.title}</strong><br><small style="color:var(--text-muted)">${n.message.substring(0, 30)}...</small></td>
            <td dir="ltr" style="text-align:right">${schedText}</td>
            <td>${statusHtml}</td>
            <td>
                <div class="action-btns">
                    ${!n.is_sent ? `
                        <button onclick="toggleNotif(${n.id}, ${n.is_active ? 0 : 1})" class="btn-icon" title="${n.is_active ? 'تعطيل' : 'تفعيل'}">
                            ${n.is_active ? '⏸' : '▶'}
                        </button>
                    ` : ''}
                    <button onclick="sendImmediate(${n.id})" class="btn-icon" title="إرسال الآن">🚀</button>
                    <button onclick="deleteNotif(${n.id})" class="btn-icon btn-del" title="حذف">🗑</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function fetchLogs() {
    const res = await fetch('/api/admin/logs');
    const data = await res.json();
    const tbody = document.getElementById('logsTableBody');
    tbody.innerHTML = '';

    data.forEach(log => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${log.notification_id}</td>
            <td dir="ltr" style="text-align:right">${log.status}</td>
            <td dir="ltr" style="text-align:right">${new Date(log.sent_at).toLocaleString('ar-EG')}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --- Actions --- //
async function handleCreateNotif(e) {
    e.preventDefault();
    
    const schedType = document.querySelector('input[name="scheduleType"]:checked').value;
    let scheduled_at = null;
    let cron_expression = null;

    if (schedType === 'date') {
        const dateVal = document.getElementById('notifDate').value;
        if (!dateVal) return alert('الرجاء اختيار التاريخ والوقت');
        scheduled_at = new Date(dateVal).toISOString();
    } else if (schedType === 'cron') {
        const cVal = document.getElementById('notifCron').value;
        if (!cVal) return alert('الرجاء كتابة تعبير الكرون');
        cron_expression = cVal;
    }

    const payload = {
        title: document.getElementById('notifTitle').value,
        message: document.getElementById('notifMsg').value,
        url: document.getElementById('notifUrl').value,
        icon: document.getElementById('notifIcon').value,
        scheduled_at: scheduled_at,
        cron_expression: cron_expression
    };

    const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
        document.getElementById('createNotifForm').reset();
        
        // If "Now", send it immediately
        if (schedType === 'now') {
            await sendImmediate(data.id);
        } else {
            alert('تمت إضافة وحفظ الجدولة بنجاح!');
        }
        fetchDashboardData();
    }
}

async function toggleNotif(id, newState) {
    await fetch(`/api/admin/notifications/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newState })
    });
    fetchNotifications();
}

async function deleteNotif(id) {
    if (!confirm('هل أنت متأكد من حذف هذا الإشعار؟')) return;
    await fetch(`/api/admin/notifications/${id}`, { method: 'DELETE' });
    fetchNotifications();
    fetchStats();
}

async function sendImmediate(id) {
    if (!confirm('سيتم إرسال هذا الإشعار الآن لكل المشتركين، متأكد؟')) return;
    
    const res = await fetch(`/api/admin/notifications/${id}/send`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
        alert('تم الإرسال لجميع المشتركين!');
        fetchDashboardData();
    } else {
        alert('حدث خطأ أثناء الإرسال');
    }
}
