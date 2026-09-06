const API = '';
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let userRole = localStorage.getItem('userRole') || '';

window.onload = () => {
    if (token && currentUser) {
        showDashboard();
    } else {
        showPage('homePage');
    }
};

function goToLogin(role) {
    const colors = { MANAGER: '#1a0050', DISPATCHER: '#0a0060', TECHNICIAN: '#c1007a', CUSTOMER: '#006080' };
    const labels = { MANAGER: '👔 Manager Login', DISPATCHER: '📋 Dispatcher Login', TECHNICIAN: '🔧 Technician Login', CUSTOMER: '🏢 Customer Login' };
    const descs  = {
        MANAGER:    'Access dashboard, work orders, customers, reports & full control',
        DISPATCHER: 'Create & assign work orders, manage customers and sites',
        TECHNICIAN: 'View assigned jobs, start work, log parts & time',
        CUSTOMER:   'Raise service requests and track your work orders'
    };
    document.getElementById('loginRoleTitle').textContent = labels[role] || 'Login';
    document.getElementById('loginRoleBadge').textContent = role;
    document.getElementById('loginRoleBadge').style.background = colors[role] || '#333';
    document.getElementById('loginRoleBadge').style.color = 'white';
    document.getElementById('loginRoleDesc').textContent = descs[role] || '';
    document.getElementById('expectedRole').value = role;
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('registerHint').style.display = role === 'CUSTOMER' ? 'block' : 'none';

    const container = document.querySelector('.home-container');
    const panel = document.getElementById('splitLoginPanel');
    container.classList.add('split-mode');
    panel.classList.add('active');
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginEmail').focus();
}

function closeSplit() {
    const container = document.querySelector('.home-container');
    const panel = document.getElementById('splitLoginPanel');
    container.classList.remove('split-mode');
    panel.classList.remove('active');
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginError').style.display = 'none';
}

async function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const pass  = document.getElementById('loginPassword').value;
    const expectedRole = document.getElementById('expectedRole').value;
    if (!email || !pass) { showError('loginError', 'Please fill all fields'); return; }
    try {
        const res = await fetch(`${API}/api/user_auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userEmail: email, password: pass })
        });
        if (!res.ok) { showError('loginError', 'Invalid email or password'); return; }
        const t = await res.text();
        const payload = JSON.parse(atob(t.split('.')[1]));
        const actualRole = payload.Role || '';

        if (expectedRole && actualRole !== expectedRole) {
            showError('loginError', `Access denied. This is ${expectedRole} Login. Your account is ${actualRole}.`);
            return;
        }

        token = t;
        localStorage.setItem('token', token);
        userRole = actualRole;
        localStorage.setItem('userRole', userRole);
        currentUser = { email };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showDashboard();
    } catch(e) { showError('loginError', 'Cannot connect to server'); }
}

async function register() {
    const body = {
        userName:  document.getElementById('regName').value,
        userEmail: document.getElementById('regEmail').value,
        password:  document.getElementById('regPassword').value,
        phone:     document.getElementById('regPhone').value,
        location:  document.getElementById('regLocation').value,
        role:      document.getElementById('regRole').value
    };
    if (!body.userName || !body.userEmail || !body.password) { showError('registerError', 'Please fill all required fields'); return; }
    try {
        const res = await fetch(`${API}/api/user_auth/register`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) { showError('registerError', data.message || 'Registration failed'); return; }
        document.getElementById('registerError').style.display = 'none';
        showSuccess('registerSuccess', 'Registered successfully! Please login.');
        setTimeout(() => showPage('homePage'), 1500);
    } catch(e) { showError('registerError', 'Cannot connect to server'); }
}

function logout() {
    fetch(`${API}/api/user_auth/logout`, { method: 'POST', headers: authHeader() });
    token = null; currentUser = null; userRole = '';
    localStorage.clear();
    showPage('homePage');
}

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
function showLogin() { showPage('loginPage'); }
function showRegister() { showPage('registerPage'); }

function showDashboard() {
    showPage('dashboardPage');
    document.getElementById('userInfo').textContent = `${currentUser?.email} (${userRole})`;
    applyRoleVisibility();
    if (userRole === 'CUSTOMER') {
        showSection('portal', document.getElementById('navPortal'));
    } else if (userRole === 'TECHNICIAN') {
        showSection('tech-dashboard', document.getElementById('navTechDashboard'));
    } else {
        showSection('dashboard', null);
    }
}

function applyRoleVisibility() {
    const isManager    = ['MANAGER', 'ADMIN'].includes(userRole);
    const isDispatcher = userRole === 'DISPATCHER';
    const isTechnician = userRole === 'TECHNICIAN';
    const isCustomer   = userRole === 'CUSTOMER';

    document.getElementById('navDashboard').style.display     = (isManager || isDispatcher) ? '' : 'none';
    document.getElementById('navCustomers').style.display     = (isManager || isDispatcher) ? '' : 'none';
    document.getElementById('navParts').style.display         = (isManager || isDispatcher) ? '' : 'none';
    document.getElementById('navPortal').style.display        = isCustomer ? '' : 'none';
    document.getElementById('navWorkOrders').style.display    = (isManager || isDispatcher) ? '' : 'none';
    document.getElementById('navUsers').style.display         = (isManager || isDispatcher) ? '' : 'none';
    document.getElementById('navTechDashboard').style.display = isTechnician ? '' : 'none';

    const addWoBtn   = document.getElementById('addWoBtn');
    const addCustBtn = document.getElementById('addCustBtn');
    const addPartBtn = document.getElementById('addPartBtn');
    if (addWoBtn)   addWoBtn.style.display   = (isManager || isDispatcher) ? '' : 'none';
    if (addCustBtn) addCustBtn.style.display = (isManager || isDispatcher) ? '' : 'none';
    if (addPartBtn) addPartBtn.style.display = isManager ? '' : 'none';
}

function showSection(name, el) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('section-' + name).classList.add('active');
    if (el) el.classList.add('active');

    if (name === 'dashboard')      loadDashboard();
    if (name === 'customers')      loadCustomers();
    if (name === 'workorders')     loadWorkOrders();
    if (name === 'parts')          loadParts();
    if (name === 'portal')         loadPortal();
    if (name === 'users')          loadUsers();
    if (name === 'tech-dashboard') loadTechDashboard();
}

function authHeader() {
    return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };
}

async function apiFetch(url, options = {}) {
    options.headers = { ...authHeader(), ...(options.headers || {}) };
    const res = await fetch(API + url, options);
    if (res.status === 401) { logout(); return null; }
    return res;
}

async function loadDashboard() {
    try {
        const res = await apiFetch('/api/reports/summary');
        if (!res || !res.ok) return;
        const data = await res.json();
        document.getElementById('statTotal').textContent      = data.total      || 0;
        document.getElementById('statNew').textContent        = data.new        || 0;
        document.getElementById('statInProgress').textContent = data.inProgress || 0;
        document.getElementById('statCompleted').textContent  = data.completed  || 0;
        document.getElementById('statClosed').textContent     = data.closed     || 0;
    } catch(e) {}
}

async function loadCustomers() {
    const tbody = document.getElementById('customersTable');
    tbody.innerHTML = '<tr><td colspan="7" class="loading">Loading...</td></tr>';
    try {
        const res = await apiFetch('/api/customers');
        if (!res || !res.ok) { tbody.innerHTML = '<tr><td colspan="7" class="loading">No access</td></tr>'; return; }
        const data = await res.json();
        if (!data.length) { tbody.innerHTML = '<tr><td colspan="7" class="loading">No customers found</td></tr>'; return; }
        tbody.innerHTML = data.map(c => `
            <tr>
                <td>${c.id}</td>
                <td><strong>${c.companyName}</strong></td>
                <td>${c.contactPerson}</td>
                <td>${c.email}</td>
                <td>${c.phone}</td>
                <td><span class="badge badge-active">${c.active ? 'Active' : 'Inactive'}</span></td>
                <td><button class="btn btn-sm btn-outline" onclick="viewSites(${c.id},'${c.companyName}')">📍 Sites</button></td>
            </tr>`).join('');
    } catch(e) { tbody.innerHTML = '<tr><td colspan="7" class="loading">Error loading</td></tr>'; }
}

async function addCustomer() {
    const body = {
        companyName:   document.getElementById('custCompany').value,
        contactPerson: document.getElementById('custContact').value,
        email:         document.getElementById('custEmail').value,
        phone:         document.getElementById('custPhone').value,
        address:       document.getElementById('custAddress').value
    };
    if (!body.companyName || !body.email) { showError('custError', 'Company name and email are required'); return; }
    const res = await apiFetch('/api/customers', { method: 'POST', body: JSON.stringify(body) });
    if (res?.ok) { closeModal('addCustomerModal'); clearFields(['custCompany','custContact','custEmail','custPhone','custAddress']); loadCustomers(); showToast('Customer added!'); }
    else { showError('custError', 'Failed to create customer'); }
}

async function viewSites(customerId, companyName) {
    const res = await apiFetch(`/api/customers/${customerId}/sites`);
    if (!res) return;
    const sites = await res.json();
    const canEdit = ['MANAGER','ADMIN','DISPATCHER'].includes(userRole);
    document.getElementById('woDetailTitle').textContent = `Sites — ${companyName}`;
    document.getElementById('woDetailContent').innerHTML = `
        <div style="padding:20px 24px">
            ${sites.length ? `
            <table class="data-table">
                <thead><tr><th>ID</th><th>Name</th><th>City</th><th>Address</th></tr></thead>
                <tbody>${sites.map(s => `<tr><td>${s.id}</td><td>${s.name}</td><td>${s.city||'-'}</td><td>${s.address}</td></tr>`).join('')}</tbody>
            </table>` : '<p style="color:#888;margin-bottom:16px">No sites yet</p>'}
            ${canEdit ? `
            <div style="margin-top:20px;padding-top:16px;border-top:1px solid #eee">
                <h4 style="margin-bottom:12px;color:#1e3a5f">Add New Site</h4>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                    <input id="sName"  placeholder="Site name *"   style="padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:14px">
                    <input id="sCity"  placeholder="City"          style="padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:14px">
                    <input id="sAddr"  placeholder="Address *"     style="padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:14px">
                    <input id="sPhone" placeholder="Contact phone" style="padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:14px">
                </div>
                <button class="btn btn-primary btn-sm" style="margin-top:12px" onclick="addSite(${customerId})">Add Site</button>
            </div>` : ''}
        </div>`;
    showModal('woDetailModal');
}

async function addSite(customerId) {
    const body = { name: document.getElementById('sName').value, city: document.getElementById('sCity').value, address: document.getElementById('sAddr').value, contactPhone: document.getElementById('sPhone').value };
    if (!body.name || !body.address) { alert('Site name and address required'); return; }
    const res = await apiFetch(`/api/customers/${customerId}/sites`, { method: 'POST', body: JSON.stringify(body) });
    if (res?.ok) { closeModal('woDetailModal'); showToast('Site added!'); }
    else { alert('Failed to add site'); }
}

async function loadWorkOrders() {
    const tbody = document.getElementById('workOrdersTable');
    tbody.innerHTML = '<tr><td colspan="7" class="loading">Loading...</td></tr>';
    try {
        const res = await apiFetch('/api/work-orders');
        if (!res || !res.ok) { tbody.innerHTML = '<tr><td colspan="7" class="loading">No access</td></tr>'; return; }
        const data = await res.json();
        if (!data.length) { tbody.innerHTML = '<tr><td colspan="7" class="loading">No work orders found</td></tr>'; return; }
        tbody.innerHTML = data.map(w => `
            <tr>
                <td><strong>${w.code}</strong></td>
                <td>${w.title}</td>
                <td><span class="badge badge-${w.priority?.toLowerCase()}">${w.priority}</span></td>
                <td>
                    <span class="badge badge-${statusClass(w.status)}">${formatStatus(w.status)}</span>
                    ${w.assignedTo ? `<div style="font-size:11px;color:#888;margin-top:3px">👷 ${w.assignedTo.userName}</div>` : ''}
                </td>
                <td>${w.customer?.companyName || '-'}</td>
                <td style="font-size:12px">${w.slaDueAt ? formatDate(w.slaDueAt) : '-'}</td>
                <td><button class="btn btn-sm btn-primary" onclick="viewWorkOrder(${w.id})">View</button></td>
            </tr>`).join('');
    } catch(e) { tbody.innerHTML = '<tr><td colspan="7" class="loading">Error loading</td></tr>'; }
}

async function loadCustomersForWO() {
    const res = await apiFetch('/api/customers');
    if (!res) return;
    const customers = await res.json();
    const sel = document.getElementById('woCustomer');
    sel.innerHTML = '<option value="">Select customer...</option>' + customers.map(c => `<option value="${c.id}">${c.companyName}</option>`).join('');
}

async function loadSitesForWO() {
    const customerId = document.getElementById('woCustomer').value;
    if (!customerId) return;
    const res = await apiFetch(`/api/customers/${customerId}/sites`);
    if (!res) return;
    const sites = await res.json();
    const sel = document.getElementById('woSite');
    sel.innerHTML = sites.length ? '<option value="">Select site...</option>' + sites.map(s => `<option value="${s.id}">${s.name}</option>`).join('') : '<option value="">No sites found</option>';
}

async function addWorkOrder() {
    const body = { title: document.getElementById('woTitle').value, description: document.getElementById('woDesc').value, priority: document.getElementById('woPriority').value, customerId: document.getElementById('woCustomer').value, siteId: document.getElementById('woSite').value };
    if (!body.title || !body.customerId || !body.siteId) { showError('woError', 'Title, customer and site are required'); return; }
    const res = await apiFetch('/api/work-orders', { method: 'POST', body: JSON.stringify(body) });
    if (res?.ok) { closeModal('addWorkOrderModal'); clearFields(['woTitle','woDesc']); loadWorkOrders(); showToast('Work order created!'); }
    else { showError('woError', 'Failed to create work order'); }
}

async function viewWorkOrder(id) {
    const [woRes, histRes, feedbackRes] = await Promise.all([
        apiFetch(`/api/work-orders/${id}`),
        apiFetch(`/api/work-orders/${id}/history`),
        apiFetch(`/api/work-orders/${id}/feedback`)
    ]);
    if (!woRes) return;
    const wo = await woRes.json();
    const history  = histRes    ? await histRes.json()    : [];
    const feedback = feedbackRes?.ok ? await feedbackRes.json() : null;
    const transitions = getAvailableTransitions(wo.status);
    const canAssign  = ['MANAGER','ADMIN','DISPATCHER'].includes(userRole);
    const canLogWork = ['TECHNICIAN','EMPLOYEE','MANAGER','ADMIN'].includes(userRole);

    document.getElementById('woDetailTitle').textContent = wo.code + ' — ' + wo.title;
    document.getElementById('woDetailContent').innerHTML = `
        <div class="detail-grid">
            <div class="detail-item"><label>Status</label><span class="badge badge-${statusClass(wo.status)}">${formatStatus(wo.status)}</span></div>
            <div class="detail-item"><label>Priority</label><span class="badge badge-${wo.priority?.toLowerCase()}">${wo.priority}</span></div>
            <div class="detail-item"><label>Customer</label><span>${wo.customer?.companyName || '-'}</span></div>
            <div class="detail-item"><label>Site</label><span>${wo.site?.name || '-'}</span></div>
            <div class="detail-item"><label>Assigned To</label><span>${wo.assignedTo?.userName || '— Not assigned —'}</span></div>
            <div class="detail-item"><label>Created</label><span>${wo.createdAt ? formatDate(wo.createdAt) : '-'}</span></div>
            <div class="detail-item" style="grid-column:1/-1"><label>Description</label><span>${wo.description || '—'}</span></div>
            ${wo.problemPhoto ? `<div class="detail-item" style="grid-column:1/-1"><label>Problem Photo</label><br><img src="${wo.problemPhoto}" style="max-width:100%;max-height:300px;border-radius:8px;margin-top:8px;border:1px solid #ddd"></div>` : ''}
        </div>
        ${transitions.length ? `<div class="transition-buttons"><strong style="font-size:13px;color:#555;margin-right:8px">Change Status:</strong>${transitions.map(t => `<button class="btn btn-sm ${t.cls}" onclick="transition(${id},'${t.status}')">${t.label}</button>`).join('')}</div>` : ''}
        ${canAssign && wo.status !== 'CLOSED' && wo.status !== 'CANCELLED' ? `
        <div style="padding:0 24px 16px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <strong style="font-size:13px;color:#555">Assign to Technician:</strong>
            <select id="assignTechSelect" style="padding:7px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px"><option value="">Loading...</option></select>
            <button class="btn btn-sm btn-warning" onclick="assignTechnician(${id})">Assign</button>
        </div>` : ''}
        ${canLogWork && wo.status === 'IN_PROGRESS' ? `
        <div style="padding:0 24px 16px;border-top:1px solid #f0f0f0;padding-top:14px">
            <strong style="font-size:13px;color:#555;display:block;margin-bottom:10px">Log Work:</strong>
            <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end">
                <div><label style="font-size:12px;color:#888;display:block">Part</label><select id="partSelect" style="padding:7px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;min-width:150px"><option value="">Select part...</option></select></div>
                <div><label style="font-size:12px;color:#888;display:block">Qty</label><input id="partQty" type="number" value="1" min="1" style="padding:7px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;width:70px"></div>
                <button class="btn btn-sm btn-success" onclick="logParts(${id})">Log Parts</button>
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;margin-top:10px">
                <div><label style="font-size:12px;color:#888;display:block">Minutes</label><input id="timeMinutes" type="number" min="1" placeholder="e.g. 60" style="padding:7px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;width:100px"></div>
                <div><label style="font-size:12px;color:#888;display:block">Note</label><input id="timeNote" type="text" placeholder="Optional" style="padding:7px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;width:180px"></div>
                <button class="btn btn-sm btn-success" onclick="logTime(${id})">Log Time</button>
            </div>
        </div>` : ''}
        ${feedback ? `
        <div style="padding:16px 24px;border-top:1px solid #f0f0f0;background:#f9fff9;border-radius:0 0 8px 8px">
            <h4 style="color:#2e7d32;margin-bottom:10px">⭐ Customer Feedback</h4>
            <div style="display:flex;gap:6px;margin-bottom:8px">${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)}</div>
            <p style="color:#333;margin-bottom:8px">${feedback.comment || 'No comment'}</p>
            ${feedback.feedbackPhoto ? `<img src="${feedback.feedbackPhoto}" style="max-width:100%;max-height:220px;border-radius:8px;border:1px solid #ddd">` : ''}
            <p style="font-size:12px;color:#888;margin-top:8px">Submitted by ${feedback.submittedBy} on ${formatDate(feedback.submittedAt)}</p>
        </div>` : ''}
        <div class="history-table">
            <h4>Status History</h4>
            ${history.length ? `
            <table class="data-table">
                <thead><tr><th>From</th><th>To</th><th>By</th><th>When</th><th>Note</th></tr></thead>
                <tbody>${history.map(h => `<tr><td>${h.fromStatus ? formatStatus(h.fromStatus) : '—'}</td><td><span class="badge badge-${statusClass(h.toStatus)}">${formatStatus(h.toStatus)}</span></td><td style="font-size:12px">${h.changedBy||'-'}</td><td style="font-size:12px">${formatDate(h.changedAt)}</td><td style="font-size:12px">${h.note||'-'}</td></tr>`).join('')}</tbody>
            </table>` : '<p style="color:#888;font-size:13px">No history yet</p>'}
        </div>`;

    showModal('woDetailModal');
    if (canAssign && wo.status !== 'CLOSED' && wo.status !== 'CANCELLED') loadTechnicians();
    if (canLogWork && wo.status === 'IN_PROGRESS') loadPartsDropdown();
}

async function loadTechnicians() {
    const sel = document.getElementById('assignTechSelect');
    if (!sel) return;
    const res = await apiFetch('/api/users/technicians');
    if (!res || !res.ok) { sel.innerHTML = '<option value="">No technicians</option>'; return; }
    const techs = await res.json();
    sel.innerHTML = '<option value="">Select technician...</option>' + techs.map(t => `<option value="${t.id}">${t.userName} (${t.userEmail})</option>`).join('');
}

async function loadPartsDropdown() {
    const sel = document.getElementById('partSelect');
    if (!sel) return;
    const res = await apiFetch('/api/parts');
    if (!res || !res.ok) return;
    const parts = await res.json();
    sel.innerHTML = '<option value="">Select part...</option>' + parts.map(p => `<option value="${p.id}">${p.name} (Stock: ${p.stockQty})</option>`).join('');
}

async function assignTechnician(workOrderId) {
    const techId = document.getElementById('assignTechSelect').value;
    if (!techId) { alert('Please select a technician'); return; }
    const res = await apiFetch(`/api/work-orders/${workOrderId}/assign`, { method: 'POST', body: JSON.stringify({ technicianId: techId }) });
    if (res?.ok) { closeModal('woDetailModal'); loadWorkOrders(); showToast('Technician assigned!'); }
    else { alert('Failed to assign'); }
}

async function transition(id, status) {
    const note = prompt(`Note for: ${formatStatus(status)} (optional):`) || '';
    const res = await apiFetch(`/api/work-orders/${id}/status`, { method: 'POST', body: JSON.stringify({ status, note }) });
    if (res?.ok) { closeModal('woDetailModal'); loadWorkOrders(); showToast('Status updated to ' + formatStatus(status)); }
    else { const e = await res?.text(); alert('Not allowed: ' + (e || 'Invalid transition')); }
}

async function logParts(workOrderId) {
    const partId = document.getElementById('partSelect').value;
    const qty    = parseInt(document.getElementById('partQty').value) || 1;
    if (!partId) { alert('Please select a part'); return; }
    const res = await apiFetch(`/api/work-orders/${workOrderId}/parts`, { method: 'POST', body: JSON.stringify({ partId, qty }) });
    if (res?.ok) { showToast('Parts logged!'); loadPartsDropdown(); }
    else { const e = await res?.text(); alert('Failed: ' + e); }
}

async function logTime(workOrderId) {
    const minutes = parseInt(document.getElementById('timeMinutes').value);
    const note    = document.getElementById('timeNote').value;
    if (!minutes || minutes < 1) { alert('Please enter valid minutes'); return; }
    const res = await apiFetch(`/api/work-orders/${workOrderId}/time`, { method: 'POST', body: JSON.stringify({ minutes, note }) });
    if (res?.ok) { showToast(`${minutes} minutes logged!`); document.getElementById('timeMinutes').value = ''; }
    else { alert('Failed to log time'); }
}

function getAvailableTransitions(status) {
    const isMgr  = ['MANAGER','ADMIN'].includes(userRole);
    const isDis  = userRole === 'DISPATCHER';
    const isTech = ['TECHNICIAN','EMPLOYEE'].includes(userRole);
    const map = {
        'NEW':         [...(isMgr||isDis ? [{ status:'ASSIGNED', label:'Assign', cls:'btn-warning' }] : []), ...(isMgr ? [{ status:'CANCELLED', label:'Cancel', cls:'btn-danger' }] : [])],
        'ASSIGNED':    [...(isTech||isMgr ? [{ status:'IN_PROGRESS', label:'▶ Start Work', cls:'btn-success' }] : []), ...(isMgr||isDis ? [{ status:'CANCELLED', label:'Cancel', cls:'btn-danger' }] : [])],
        'IN_PROGRESS': [...(isTech||isMgr ? [{ status:'ON_HOLD', label:'⏸ Hold', cls:'btn-warning' }] : []), ...(isTech||isMgr ? [{ status:'COMPLETED', label:'✓ Complete', cls:'btn-success' }] : [])],
        'ON_HOLD':     [...(isTech||isMgr ? [{ status:'IN_PROGRESS', label:'▶ Resume', cls:'btn-success' }] : []), ...(isMgr ? [{ status:'CANCELLED', label:'Cancel', cls:'btn-danger' }] : [])],
        'COMPLETED':   [...(isMgr ? [{ status:'CLOSED', label:'✓ Close', cls:'btn-primary' }] : []), ...(isMgr ? [{ status:'IN_PROGRESS', label:'↩ Reopen', cls:'btn-warning' }] : [])],
        'CLOSED': [], 'CANCELLED': []
    };
    return map[status] || [];
}

async function loadParts() {
    const tbody = document.getElementById('partsTable');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading...</td></tr>';
    try {
        const res = await apiFetch('/api/parts');
        if (!res || !res.ok) { tbody.innerHTML = '<tr><td colspan="6" class="loading">No access</td></tr>'; return; }
        const data = await res.json();
        if (!data.length) { tbody.innerHTML = '<tr><td colspan="6" class="loading">No parts found</td></tr>'; return; }
        const canDelete = ['MANAGER','ADMIN'].includes(userRole);
        tbody.innerHTML = data.map(p => `
            <tr>
                <td>${p.id}</td><td><strong>${p.name}</strong></td><td><code>${p.sku}</code></td>
                <td>₹${p.unitCost?.toFixed(2)||'0.00'}</td>
                <td><span style="color:${p.stockQty<5?'#c62828':'#388e3c'};font-weight:600">${p.stockQty}${p.stockQty<5?' ⚠':''}</span></td>
                <td>${canDelete ? `<button class="btn btn-sm btn-danger" onclick="deletePart(${p.id})">Delete</button>` : '—'}</td>
            </tr>`).join('');
    } catch(e) { tbody.innerHTML = '<tr><td colspan="6" class="loading">Error</td></tr>'; }
}

async function addPart() {
    const body = { name: document.getElementById('partName').value, sku: document.getElementById('partSku').value, unitCost: parseFloat(document.getElementById('partCost').value)||0, stockQty: parseInt(document.getElementById('partStock').value)||0 };
    if (!body.name || !body.sku) { showError('partError', 'Name and SKU are required'); return; }
    const res = await apiFetch('/api/parts', { method: 'POST', body: JSON.stringify(body) });
    if (res?.ok) { closeModal('addPartModal'); clearFields(['partName','partSku','partCost','partStock']); loadParts(); showToast('Part added!'); }
    else { showError('partError', 'Failed to add part'); }
}

async function deletePart(id) {
    if (!confirm('Delete this part?')) return;
    const res = await apiFetch(`/api/parts/${id}`, { method: 'DELETE' });
    if (res?.ok) { loadParts(); showToast('Part deleted'); }
    else { alert('Failed to delete'); }
}

async function loadPortal() {
    const tbody = document.getElementById('portalTable');
    tbody.innerHTML = '<tr><td colspan="7" class="loading">Loading your requests...</td></tr>';
    try {
        const res = await apiFetch('/api/portal/my-orders');
        if (!res || !res.ok) {
            tbody.innerHTML = '<tr><td colspan="6" class="loading">Unable to load. Make sure your email is registered as a customer.</td></tr>';
            document.getElementById('portalWelcome').innerHTML = '<p style="color:#c62828;font-size:14px">⚠ Your email is not linked to a customer account. Ask your manager to register your company.</p>';
            return;
        }
        const data = await res.json();

        const counts = { new: 0, assigned: 0, accepted: 0, completed: 0, closed: 0 };
        data.forEach(w => {
            if (w.status === 'NEW')         counts.new++;
            else if (w.status === 'ASSIGNED') counts.assigned++;
            else if (w.status === 'IN_PROGRESS') counts.accepted++;
            else if (w.status === 'COMPLETED')   counts.completed++;
            else if (w.status === 'CLOSED')      counts.closed++;
        });

        document.getElementById('portalWelcome').innerHTML = `
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:14px">
                <span style="font-size:18px;font-weight:700;color:#1e3a5f">Your Requests:</span>
                <span style="font-size:22px;font-weight:800;color:#2d6a9f">${data.length}</span>
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap">
                ${counts.new        ? `<span style="background:#e3f2fd;color:#1565c0;padding:5px 14px;border-radius:20px;font-size:13px;font-weight:600">🕐 Pending: ${counts.new}</span>` : ''}
                ${counts.assigned   ? `<span style="background:#fff3e0;color:#e65100;padding:5px 14px;border-radius:20px;font-size:13px;font-weight:600">👷 Technician Assigned: ${counts.assigned}</span>` : ''}
                ${counts.accepted   ? `<span style="background:#f3e5f5;color:#6a1b9a;padding:5px 14px;border-radius:20px;font-size:13px;font-weight:600">🔧 Work in Progress: ${counts.accepted}</span>` : ''}
                ${counts.completed  ? `<span style="background:#e8f5e9;color:#2e7d32;padding:5px 14px;border-radius:20px;font-size:13px;font-weight:600">✅ Completed: ${counts.completed}</span>` : ''}
                ${counts.closed     ? `<span style="background:#f5f5f5;color:#555;padding:5px 14px;border-radius:20px;font-size:13px;font-weight:600">🔒 Closed: ${counts.closed}</span>` : ''}
                ${data.length === 0 ? `<span style="color:#888;font-size:13px">No requests yet. Click + Raise New Request to get started.</span>` : ''}
            </div>`;

        if (!data.length) { tbody.innerHTML = '<tr><td colspan="6" class="loading">No requests yet. Click Raise New Request to submit one.</td></tr>'; return; }
        tbody.innerHTML = data.map(w => `
            <tr>
                <td><strong>${w.code}</strong></td>
                <td>${w.title}</td>
                <td><span class="badge badge-${w.priority?.toLowerCase()}">${w.priority}</span></td>
                <td><span class="badge badge-${statusClass(w.status)}">${customerStatusLabel(w.status)}</span></td>
                <td>${w.site?.name || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="viewWorkOrder(${w.id})">View</button>
                    ${(w.status === 'COMPLETED' || w.status === 'CLOSED') ? `<button class="btn btn-sm btn-success" style="margin-left:4px" onclick="openFeedbackModal(${w.id})">⭐ Feedback</button>` : ''}
                </td>
            </tr>`).join('');
        await loadPortalSites();
    } catch(e) { tbody.innerHTML = '<tr><td colspan="7" class="loading">Error loading</td></tr>'; }
}

async function loadPortalSites() {
    const res = await apiFetch('/api/portal/my-sites');
    if (!res || !res.ok) return;
    const customer = await res.json();
    if (!customer || !customer.id) return;
    const sitesRes = await apiFetch(`/api/customers/${customer.id}/sites`);
    if (!sitesRes || !sitesRes.ok) return;
    const sites = await sitesRes.json();
    const sel = document.getElementById('reqSite');
    if (sel) {
        sel.innerHTML = sites.length ? '<option value="">Select site...</option>' + sites.map(s => `<option value="${s.id}">${s.name}</option>`).join('') : '<option value="">No sites available</option>';
    }
}

async function raiseRequest() {
    const photoInput = document.getElementById('reqPhoto');
    let problemPhoto = '';
    if (photoInput && photoInput.files && photoInput.files[0]) {
        problemPhoto = await toBase64(photoInput.files[0]);
    }
    const body = {
        title:        document.getElementById('reqTitle').value,
        description:  document.getElementById('reqDesc').value,
        priority:     document.getElementById('reqPriority').value,
        siteId:       document.getElementById('reqSite').value,
        problemPhoto: problemPhoto
    };
    if (!body.title || !body.siteId) { showError('reqError', 'Title and site are required'); return; }
    const res = await apiFetch('/api/portal/raise-request', { method: 'POST', body: JSON.stringify(body) });
    if (res?.ok) {
        closeModal('raiseRequestModal');
        clearFields(['reqTitle','reqDesc']);
        if (photoInput) photoInput.value = '';
        document.getElementById('reqPhotoPreview').style.display = 'none';
        loadPortal();
        showToast('Request submitted successfully!');
    } else {
        const e = await res?.text();
        showError('reqError', 'Failed: ' + (e || 'Unknown error'));
    }
}

async function loadUsers() {
    const tbody = document.getElementById('usersTable');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading...</td></tr>';
    try {
        const res = await apiFetch('/api/users/staff');
        if (!res || !res.ok) { tbody.innerHTML = '<tr><td colspan="6" class="loading">No access</td></tr>'; return; }
        const data = await res.json();
        if (!data.length) { tbody.innerHTML = '<tr><td colspan="6" class="loading">No staff added yet. Click Add Staff to create accounts.</td></tr>'; return; }
        tbody.innerHTML = data.map(u => `
            <tr>
                <td>${u.id}</td>
                <td><strong>${u.userName}</strong></td>
                <td>${u.userEmail}</td>
                <td><span class="badge" style="background:${u.role==='TECHNICIAN'?'#fff3e0':'#e8eaf6'};color:${u.role==='TECHNICIAN'?'#e65100':'#3949ab'}">${u.role}</span></td>
                <td>${u.phone || '-'}</td>
                <td><button class="btn btn-sm btn-danger" onclick="deleteStaff(${u.id}, '${u.userName}')">Remove</button></td>
            </tr>`).join('');
    } catch(e) { tbody.innerHTML = '<tr><td colspan="6" class="loading">Error loading</td></tr>'; }
}

async function addStaff() {
    const body = {
        userName: document.getElementById('staffName').value,
        userEmail: document.getElementById('staffEmail').value,
        password: document.getElementById('staffPassword').value,
        phone: document.getElementById('staffPhone').value,
        role: document.getElementById('staffRole').value
    };
    if (!body.userName || !body.userEmail || !body.password) { showError('staffError', 'Name, email and password are required'); return; }
    const res = await apiFetch('/api/users/staff', { method: 'POST', body: JSON.stringify(body) });
    if (res?.ok) {
        closeModal('addUserModal');
        clearFields(['staffName','staffEmail','staffPassword','staffPhone']);
        loadUsers();
        showToast(`${body.role} account created for ${body.userEmail}`);
    } else {
        const e = await res?.text();
        showError('staffError', e || 'Failed to create user');
    }
}

async function deleteStaff(id, name) {
    if (!confirm(`Remove ${name} from the system?`)) return;
    const res = await apiFetch(`/api/users/staff/${id}`, { method: 'DELETE' });
    if (res?.ok) { loadUsers(); showToast(`${name} removed`); }
    else { alert('Failed to remove user'); }
}

function showModal(id) {
    document.getElementById(id).classList.add('open');
    if (id === 'addWorkOrderModal') loadCustomersForWO();
    if (id === 'addUserModal') {
        const roleSelect = document.getElementById('staffRole');
        if (userRole === 'DISPATCHER') {
            roleSelect.innerHTML = '<option value="TECHNICIAN">Technician</option>';
        } else {
            roleSelect.innerHTML = '<option value="TECHNICIAN">Technician</option><option value="DISPATCHER">Dispatcher</option>';
        }
    }
}
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

async function loadTechDashboard() {
    try {
        const res = await apiFetch('/api/reports/my-summary');
        if (!res || !res.ok) return;
        const data = await res.json();
        document.getElementById('statTechTotal').textContent     = data.totalAssigned ?? '-';
        document.getElementById('statTechProgress').textContent  = data.inProgress    ?? '-';
        document.getElementById('statTechCompleted').textContent = data.completed     ?? '-';
        document.getElementById('statTechFeedback').textContent  = data.feedbackCount ?? '-';
    } catch(e) {}

    const tbody = document.getElementById('techWorkOrdersTable');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading...</td></tr>';
    try {
        const res = await apiFetch('/api/work-orders/my');
        if (!res || !res.ok) {
            tbody.innerHTML = '<tr><td colspan="6" class="loading">Unable to load jobs</td></tr>';
            return;
        }
        const data = await res.json();
        if (!data.length) { tbody.innerHTML = '<tr><td colspan="6" class="loading">No work orders assigned to you yet</td></tr>'; return; }
        tbody.innerHTML = data.map(w => `
            <tr>
                <td><strong>${w.code}</strong></td>
                <td>${w.title}</td>
                <td><span class="badge badge-${w.priority?.toLowerCase()}">${w.priority}</span></td>
                <td>
                    <span class="badge badge-${statusClass(w.status)}">${techStatusLabel(w.status)}</span>
                </td>
                <td>${w.customer?.companyName || '-'}</td>
                <td><button class="btn btn-sm btn-primary" onclick="viewWorkOrder(${w.id})">View</button></td>
            </tr>`).join('');
    } catch(e) { tbody.innerHTML = '<tr><td colspan="6" class="loading">Error loading</td></tr>'; }
}

function openFeedbackModal(workOrderId) {
    document.getElementById('feedbackWoId').value = workOrderId;
    document.getElementById('feedbackRating').value = '5';
    document.getElementById('feedbackComment').value = '';
    document.getElementById('feedbackPhotoInput').value = '';
    document.getElementById('feedbackPhotoPreview').style.display = 'none';
    document.getElementById('feedbackError').style.display = 'none';
    document.getElementById('feedbackSuccess').style.display = 'none';
    updateStars(5);
    showModal('feedbackModal');
}

function updateStars(val) {
    document.getElementById('feedbackRating').value = val;
    document.querySelectorAll('.star-btn').forEach((btn, i) => {
        btn.style.color = i < val ? '#f59e0b' : '#ccc';
    });
}

async function submitFeedback() {
    const workOrderId = document.getElementById('feedbackWoId').value;
    const rating      = parseInt(document.getElementById('feedbackRating').value);
    const comment     = document.getElementById('feedbackComment').value;
    const photoInput  = document.getElementById('feedbackPhotoInput');
    let feedbackPhoto = '';
    if (photoInput && photoInput.files && photoInput.files[0]) {
        feedbackPhoto = await toBase64(photoInput.files[0]);
    }
    if (!rating || rating < 1 || rating > 5) { showError('feedbackError', 'Please select a star rating'); return; }
    const res = await apiFetch(`/api/portal/feedback/${workOrderId}`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment, feedbackPhoto })
    });
    if (res?.ok) {
        showSuccess('feedbackSuccess', 'Feedback submitted! Thank you.');
        setTimeout(() => { closeModal('feedbackModal'); loadPortal(); }, 1500);
    } else {
        showError('feedbackError', 'Failed to submit feedback. Please try again.');
    }
}

function previewPhoto(inputId, previewId) {
    const input   = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!input || !input.files || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = e => { preview.src = e.target.result; preview.style.display = 'block'; };
    reader.readAsDataURL(input.files[0]);
}

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function showToast(msg) {
    let t = document.getElementById('toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'toast';
        t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1e3a5f;color:white;padding:12px 20px;border-radius:8px;font-size:14px;z-index:9999;box-shadow:0 4px 15px rgba(0,0,0,0.2);transition:opacity 0.3s';
        document.body.appendChild(t);
    }
    t.textContent = msg; t.style.opacity = '1';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.opacity = '0'; }, 3000);
}

function showError(id, msg) { const el = document.getElementById(id); if(el){el.textContent=msg;el.style.display='block';} }
function showSuccess(id, msg) { const el = document.getElementById(id); if(el){el.textContent=msg;el.style.display='block';} }
function clearFields(ids) { ids.forEach(id => { const el = document.getElementById(id); if(el) el.value=''; }); }
function statusClass(s) { return { NEW:'new', ASSIGNED:'assigned', IN_PROGRESS:'inprogress', ON_HOLD:'onhold', COMPLETED:'completed', CLOSED:'closed', CANCELLED:'cancelled' }[s] || 'new'; }
function formatStatus(s) { return { NEW:'New', ASSIGNED:'Assigned', IN_PROGRESS:'In Progress', ON_HOLD:'On Hold', COMPLETED:'Completed', CLOSED:'Closed', CANCELLED:'Cancelled' }[s] || s; }
function customerStatusLabel(s) { return { NEW:'Pending', ASSIGNED:'Technician Assigned', IN_PROGRESS:'Work in Progress', ON_HOLD:'On Hold', COMPLETED:'Completed', CLOSED:'Closed', CANCELLED:'Cancelled' }[s] || s; }
function techStatusLabel(s) { return { NEW:'Pending', ASSIGNED:'Assigned to Me', IN_PROGRESS:'Accepted — In Progress', ON_HOLD:'On Hold', COMPLETED:'Completed', CLOSED:'Closed', CANCELLED:'Cancelled' }[s] || s; }
function formatDate(d) { if (!d) return '-'; return new Date(d).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }); }
function isSlaWarning(d) { if (!d) return false; return new Date(d) < new Date(Date.now() + 2 * 60 * 60 * 1000); }
