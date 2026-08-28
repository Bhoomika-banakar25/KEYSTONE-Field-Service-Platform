const API = '';
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let userRole = localStorage.getItem('userRole') || '';

// ── Init ──────────────────────────────────────────────────────────────────
window.onload = () => {
    if (token && currentUser) {
        showDashboard();
    } else {
        showPage('loginPage');
    }
};

// ── Auth ──────────────────────────────────────────────────────────────────
async function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const pass  = document.getElementById('loginPassword').value;
    if (!email || !pass) { showError('loginError', 'Please fill all fields'); return; }

    try {
        const res = await fetch(`${API}/api/user_auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userEmail: email, password: pass })
        });
        if (!res.ok) { showError('loginError', 'Invalid email or password'); return; }
        const t = await res.text();
        token = t;
        localStorage.setItem('token', token);

        // Decode JWT to get role
        const payload = JSON.parse(atob(t.split('.')[1]));
        userRole = payload.Role || '';
        localStorage.setItem('userRole', userRole);
        currentUser = { email };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        showDashboard();
    } catch(e) { showError('loginError', 'Cannot connect to server'); }
}

async function register() {
    const body = {
        userName: document.getElementById('regName').value,
        userEmail: document.getElementById('regEmail').value,
        password:  document.getElementById('regPassword').value,
        phone:     document.getElementById('regPhone').value,
        role:      document.getElementById('regRole').value
    };
    if (!body.userName || !body.userEmail || !body.password) {
        showError('registerError', 'Please fill all required fields'); return;
    }
    try {
        const res = await fetch(`${API}/api/user_auth/register`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) { showError('registerError', data.message || 'Registration failed'); return; }
        document.getElementById('registerError').style.display = 'none';
        showSuccess('registerSuccess', 'Registered successfully! Please login.');
        setTimeout(showLogin, 1500);
    } catch(e) { showError('registerError', 'Cannot connect to server'); }
}

function logout() {
    fetch(`${API}/api/user_auth/logout`, { method: 'POST', headers: authHeader() });
    token = null; currentUser = null; userRole = '';
    localStorage.clear();
    showPage('loginPage');
}

// ── Navigation ────────────────────────────────────────────────────────────
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
function showLogin()    { showPage('loginPage'); }
function showRegister() { showPage('registerPage'); }

function showDashboard() {
    showPage('dashboardPage');
    document.getElementById('userInfo').textContent = `${currentUser?.email} (${userRole})`;
    applyRoleVisibility();
    showSection('dashboard');
}

// Hide/show nav items based on role
function applyRoleVisibility() {
    const isManager    = ['MANAGER','ADMIN'].includes(userRole);
    const isDispatcher = ['DISPATCHER'].includes(userRole);
    const isTechnician = ['TECHNICIAN','EMPLOYEE'].includes(userRole);
    const isCustomer   = ['CUSTOMER'].includes(userRole);

    // Nav items
    const nav = {
        customers:  isManager || isDispatcher,
        parts:      isManager || isDispatcher,
        workorders: true // everyone sees work orders
    };
    document.getElementById('navCustomers').style.display  = nav.customers  ? '' : 'none';
    document.getElementById('navParts').style.display      = nav.parts      ? '' : 'none';

    // Add buttons
    const addWoBtn = document.getElementById('addWoBtn');
    if (addWoBtn) addWoBtn.style.display = (isManager || isDispatcher) ? '' : 'none';
    const addCustBtn = document.getElementById('addCustBtn');
    if (addCustBtn) addCustBtn.style.display = (isManager || isDispatcher) ? '' : 'none';
    const addPartBtn = document.getElementById('addPartBtn');
    if (addPartBtn) addPartBtn.style.display = isManager ? '' : 'none';
}

function showSection(name, el) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('section-' + name).classList.add('active');
    if (el) el.classList.add('active');

    if (name === 'dashboard')  loadDashboard();
    if (name === 'customers')  loadCustomers();
    if (name === 'workorders') loadWorkOrders();
    if (name === 'parts')      loadParts();
}

// ── API Helper ────────────────────────────────────────────────────────────
function authHeader() {
    return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };
}

async function apiFetch(url, options = {}) {
    options.headers = { ...authHeader(), ...(options.headers || {}) };
    const res = await fetch(API + url, options);
    if (res.status === 401) { logout(); return null; }
    return res;
}

// ── Dashboard ─────────────────────────────────────────────────────────────
async function loadDashboard() {
    try {
        const res = await apiFetch('/api/reports/summary');
        if (!res || !res.ok) return;
        const data = await res.json();
        document.getElementById('statTotal').textContent      = data.total       || 0;
        document.getElementById('statNew').textContent        = data.new         || 0;
        document.getElementById('statInProgress').textContent = data.inProgress  || 0;
        document.getElementById('statCompleted').textContent  = data.completed   || 0;
        document.getElementById('statClosed').textContent     = data.closed      || 0;
        document.getElementById('statBreached').textContent   = data.slaBreached || 0;
    } catch(e) { /* no dashboard permission */ }
}

// ── Customers ─────────────────────────────────────────────────────────────
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
    if (res?.ok) {
        closeModal('addCustomerModal');
        clearFields(['custCompany','custContact','custEmail','custPhone','custAddress']);
        loadCustomers();
    } else { showError('custError', 'Failed to create customer'); }
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
                    <input id="sName"  placeholder="Site name *"    style="padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:14px">
                    <input id="sCity"  placeholder="City"           style="padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:14px">
                    <input id="sAddr"  placeholder="Address *"      style="padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:14px">
                    <input id="sPhone" placeholder="Contact phone"  style="padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:14px">
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
    if (res?.ok) { closeModal('woDetailModal'); showToast('Site added successfully!'); }
    else { alert('Failed to add site'); }
}

// ── Work Orders ───────────────────────────────────────────────────────────
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
                <td><span class="badge badge-${statusClass(w.status)}">${formatStatus(w.status)}</span>
                    ${w.slaBreached ? '<span style="color:#c62828;font-size:11px;margin-left:4px">⚠ SLA</span>' : ''}</td>
                <td>${w.customer?.companyName || '-'}</td>
                <td style="font-size:12px;color:${isSlaWarning(w.slaDueAt)?'#e65100':'#555'}">${w.slaDueAt ? formatDate(w.slaDueAt) : '-'}</td>
                <td><button class="btn btn-sm btn-primary" onclick="viewWorkOrder(${w.id})">View</button></td>
            </tr>`).join('');
    } catch(e) { tbody.innerHTML = '<tr><td colspan="7" class="loading">Error loading</td></tr>'; }
}

async function loadCustomersForWO() {
    const res = await apiFetch('/api/customers');
    if (!res) return;
    const customers = await res.json();
    const sel = document.getElementById('woCustomer');
    sel.innerHTML = '<option value="">Select customer...</option>' +
        customers.map(c => `<option value="${c.id}">${c.companyName}</option>`).join('');
}

async function loadSitesForWO() {
    const customerId = document.getElementById('woCustomer').value;
    if (!customerId) return;
    const res = await apiFetch(`/api/customers/${customerId}/sites`);
    if (!res) return;
    const sites = await res.json();
    const sel = document.getElementById('woSite');
    sel.innerHTML = sites.length
        ? '<option value="">Select site...</option>' + sites.map(s => `<option value="${s.id}">${s.name}</option>`).join('')
        : '<option value="">No sites — add one first</option>';
}

async function addWorkOrder() {
    const body = {
        title:       document.getElementById('woTitle').value,
        description: document.getElementById('woDesc').value,
        priority:    document.getElementById('woPriority').value,
        customerId:  document.getElementById('woCustomer').value,
        siteId:      document.getElementById('woSite').value
    };
    if (!body.title || !body.customerId || !body.siteId) { showError('woError', 'Title, customer and site are required'); return; }
    const res = await apiFetch('/api/work-orders', { method: 'POST', body: JSON.stringify(body) });
    if (res?.ok) {
        closeModal('addWorkOrderModal');
        clearFields(['woTitle','woDesc']);
        loadWorkOrders();
        showToast('Work order created!');
    } else { showError('woError', 'Failed to create work order'); }
}

async function viewWorkOrder(id) {
    const [woRes, histRes] = await Promise.all([
        apiFetch(`/api/work-orders/${id}`),
        apiFetch(`/api/work-orders/${id}/history`)
    ]);
    if (!woRes) return;
    const wo      = await woRes.json();
    const history = histRes ? await histRes.json() : [];
    const transitions = getAvailableTransitions(wo.status);
    const canAssign = ['MANAGER','ADMIN','DISPATCHER'].includes(userRole);
    const canLogWork = ['TECHNICIAN','EMPLOYEE','MANAGER','ADMIN'].includes(userRole);

    document.getElementById('woDetailTitle').textContent = wo.code + ' — ' + wo.title;
    document.getElementById('woDetailContent').innerHTML = `
        <div class="detail-grid">
            <div class="detail-item"><label>Status</label><span class="badge badge-${statusClass(wo.status)}">${formatStatus(wo.status)}</span></div>
            <div class="detail-item"><label>Priority</label><span class="badge badge-${wo.priority?.toLowerCase()}">${wo.priority}</span></div>
            <div class="detail-item"><label>Customer</label><span>${wo.customer?.companyName || '-'}</span></div>
            <div class="detail-item"><label>Site</label><span>${wo.site?.name || '-'}</span></div>
            <div class="detail-item"><label>Assigned To</label><span>${wo.assignedTo?.userName || '— Not assigned —'}</span></div>
            <div class="detail-item"><label>SLA Due</label><span style="color:${isSlaWarning(wo.slaDueAt)?'#e65100':'#333'}">${wo.slaDueAt ? formatDate(wo.slaDueAt) : '-'}</span></div>
            <div class="detail-item"><label>SLA Breached</label><span style="color:${wo.slaBreached?'#c62828':'#388e3c'}">${wo.slaBreached ? '⚠ YES' : '✓ No'}</span></div>
            <div class="detail-item"><label>Created</label><span>${wo.createdAt ? formatDate(wo.createdAt) : '-'}</span></div>
            <div class="detail-item" style="grid-column:1/-1"><label>Description</label><span>${wo.description || '—'}</span></div>
        </div>

        ${transitions.length ? `
        <div class="transition-buttons">
            <strong style="font-size:13px;color:#555;margin-right:8px">Change Status:</strong>
            ${transitions.map(t => `<button class="btn btn-sm ${t.cls}" onclick="transition(${id},'${t.status}')">${t.label}</button>`).join('')}
        </div>` : '<div style="padding:0 24px 12px;color:#888;font-size:13px">No transitions available for this status.</div>'}

        ${canAssign && wo.status !== 'CLOSED' && wo.status !== 'CANCELLED' ? `
        <div style="padding:0 24px 16px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <strong style="font-size:13px;color:#555">Assign to Technician:</strong>
            <select id="assignTechSelect" style="padding:7px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px">
                <option value="">Loading technicians...</option>
            </select>
            <button class="btn btn-sm btn-warning" onclick="assignTechnician(${id})">Assign</button>
        </div>` : ''}

        ${canLogWork && wo.status === 'IN_PROGRESS' ? `
        <div style="padding:0 24px 16px;border-top:1px solid #f0f0f0;padding-top:14px">
            <strong style="font-size:13px;color:#555;display:block;margin-bottom:10px">Log Work:</strong>
            <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
                <div>
                    <label style="font-size:12px;color:#888;display:block">Parts Used</label>
                    <select id="partSelect" style="padding:7px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;min-width:150px">
                        <option value="">Select part...</option>
                    </select>
                </div>
                <div>
                    <label style="font-size:12px;color:#888;display:block">Qty</label>
                    <input id="partQty" type="number" value="1" min="1" style="padding:7px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;width:70px">
                </div>
                <button class="btn btn-sm btn-success" style="margin-top:16px" onclick="logParts(${id})">Log Parts</button>
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:10px">
                <div>
                    <label style="font-size:12px;color:#888;display:block">Time (minutes)</label>
                    <input id="timeMinutes" type="number" min="1" placeholder="e.g. 60" style="padding:7px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;width:120px">
                </div>
                <div>
                    <label style="font-size:12px;color:#888;display:block">Note</label>
                    <input id="timeNote" type="text" placeholder="Optional note" style="padding:7px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;width:200px">
                </div>
                <button class="btn btn-sm btn-success" style="margin-top:16px" onclick="logTime(${id})">Log Time</button>
            </div>
        </div>` : ''}

        <div class="history-table">
            <h4>Status History</h4>
            ${history.length ? `
            <table class="data-table">
                <thead><tr><th>From</th><th>To</th><th>By</th><th>When</th><th>Note</th></tr></thead>
                <tbody>${history.map(h => `
                    <tr>
                        <td>${h.fromStatus ? formatStatus(h.fromStatus) : '—'}</td>
                        <td><span class="badge badge-${statusClass(h.toStatus)}">${formatStatus(h.toStatus)}</span></td>
                        <td style="font-size:12px">${h.changedBy || '-'}</td>
                        <td style="font-size:12px">${formatDate(h.changedAt)}</td>
                        <td style="font-size:12px">${h.note || '-'}</td>
                    </tr>`).join('')}
                </tbody>
            </table>` : '<p style="color:#888;font-size:13px">No history yet</p>'}
        </div>`;

    showModal('woDetailModal');

    // Load technicians and parts in background
    if (canAssign && wo.status !== 'CLOSED' && wo.status !== 'CANCELLED') loadTechnicians();
    if (canLogWork && wo.status === 'IN_PROGRESS') loadPartsDropdown();
}

async function loadTechnicians() {
    const sel = document.getElementById('assignTechSelect');
    if (!sel) return;
    try {
        const res = await apiFetch('/api/users/technicians');
        if (!res || !res.ok) { sel.innerHTML = '<option value="">No technicians found</option>'; return; }
        const techs = await res.json();
        sel.innerHTML = '<option value="">Select technician...</option>' +
            techs.map(t => `<option value="${t.id}">${t.userName} (${t.userEmail})</option>`).join('');
    } catch(e) { sel.innerHTML = '<option value="">Error loading</option>'; }
}

async function loadPartsDropdown() {
    const sel = document.getElementById('partSelect');
    if (!sel) return;
    const res = await apiFetch('/api/parts');
    if (!res || !res.ok) return;
    const parts = await res.json();
    sel.innerHTML = '<option value="">Select part...</option>' +
        parts.map(p => `<option value="${p.id}">${p.name} (Stock: ${p.stockQty})</option>`).join('');
}

async function assignTechnician(workOrderId) {
    const techId = document.getElementById('assignTechSelect').value;
    if (!techId) { alert('Please select a technician'); return; }
    const res = await apiFetch(`/api/work-orders/${workOrderId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ technicianId: techId })
    });
    if (res?.ok) {
        closeModal('woDetailModal');
        loadWorkOrders();
        showToast('Technician assigned successfully!');
    } else { alert('Failed to assign technician'); }
}

async function transition(id, status) {
    const note = prompt(`Add a note for: ${formatStatus(status)} (optional):`) || '';
    const res = await apiFetch(`/api/work-orders/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status, note })
    });
    if (res?.ok) {
        closeModal('woDetailModal');
        loadWorkOrders();
        showToast('Status updated to ' + formatStatus(status));
    } else {
        const err = await res?.text();
        alert('Not allowed: ' + (err || 'Invalid transition'));
    }
}

async function logParts(workOrderId) {
    const partId = document.getElementById('partSelect').value;
    const qty    = parseInt(document.getElementById('partQty').value) || 1;
    if (!partId) { alert('Please select a part'); return; }
    const res = await apiFetch(`/api/work-orders/${workOrderId}/parts`, {
        method: 'POST',
        body: JSON.stringify({ partId, qty })
    });
    if (res?.ok) { showToast('Parts logged!'); loadPartsDropdown(); }
    else { const e = await res?.text(); alert('Failed: ' + e); }
}

async function logTime(workOrderId) {
    const minutes = parseInt(document.getElementById('timeMinutes').value);
    const note    = document.getElementById('timeNote').value;
    if (!minutes || minutes < 1) { alert('Please enter valid minutes'); return; }
    const res = await apiFetch(`/api/work-orders/${workOrderId}/time`, {
        method: 'POST',
        body: JSON.stringify({ minutes, note })
    });
    if (res?.ok) { showToast(`${minutes} minutes logged!`); document.getElementById('timeMinutes').value = ''; document.getElementById('timeNote').value = ''; }
    else { alert('Failed to log time'); }
}

function getAvailableTransitions(status) {
    const isMgr  = ['MANAGER','ADMIN'].includes(userRole);
    const isDis  = ['DISPATCHER'].includes(userRole);
    const isTech = ['TECHNICIAN','EMPLOYEE'].includes(userRole);
    const map = {
        'NEW':         [
            ...(isMgr||isDis ? [{ status:'ASSIGNED',    label:'Assign',       cls:'btn-warning' }] : []),
            ...(isMgr        ? [{ status:'CANCELLED',   label:'Cancel',       cls:'btn-danger'  }] : [])
        ],
        'ASSIGNED':    [
            ...(isTech||isMgr ? [{ status:'IN_PROGRESS', label:'▶ Start Work', cls:'btn-success' }] : []),
            ...(isMgr||isDis  ? [{ status:'CANCELLED',   label:'Cancel',       cls:'btn-danger'  }] : [])
        ],
        'IN_PROGRESS': [
            ...(isTech||isMgr ? [{ status:'ON_HOLD',   label:'⏸ Hold',      cls:'btn-warning' }] : []),
            ...(isTech||isMgr ? [{ status:'COMPLETED', label:'✓ Complete',  cls:'btn-success' }] : [])
        ],
        'ON_HOLD':     [
            ...(isTech||isMgr ? [{ status:'IN_PROGRESS', label:'▶ Resume',  cls:'btn-success' }] : []),
            ...(isMgr         ? [{ status:'CANCELLED',   label:'Cancel',    cls:'btn-danger'  }] : [])
        ],
        'COMPLETED':   [
            ...(isMgr ? [{ status:'CLOSED',      label:'✓ Close',   cls:'btn-primary' }] : []),
            ...(isMgr ? [{ status:'IN_PROGRESS', label:'↩ Reopen',  cls:'btn-warning' }] : [])
        ],
        'CLOSED':      [],
        'CANCELLED':   []
    };
    return map[status] || [];
}

// ── Parts ─────────────────────────────────────────────────────────────────
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
                <td>${p.id}</td>
                <td><strong>${p.name}</strong></td>
                <td><code>${p.sku}</code></td>
                <td>₹${p.unitCost?.toFixed(2) || '0.00'}</td>
                <td><span style="color:${p.stockQty < 5 ? '#c62828' : '#388e3c'};font-weight:600">${p.stockQty} ${p.stockQty < 5 ? '⚠' : ''}</span></td>
                <td>${canDelete ? `<button class="btn btn-sm btn-danger" onclick="deletePart(${p.id})">Delete</button>` : '—'}</td>
            </tr>`).join('');
    } catch(e) { tbody.innerHTML = '<tr><td colspan="6" class="loading">Error</td></tr>'; }
}

async function addPart() {
    const body = {
        name:     document.getElementById('partName').value,
        sku:      document.getElementById('partSku').value,
        unitCost: parseFloat(document.getElementById('partCost').value) || 0,
        stockQty: parseInt(document.getElementById('partStock').value) || 0
    };
    if (!body.name || !body.sku) { showError('partError', 'Name and SKU are required'); return; }
    const res = await apiFetch('/api/parts', { method: 'POST', body: JSON.stringify(body) });
    if (res?.ok) {
        closeModal('addPartModal');
        clearFields(['partName','partSku','partCost','partStock']);
        loadParts();
        showToast('Part added!');
    } else { showError('partError', 'Failed to add part'); }
}

async function deletePart(id) {
    if (!confirm('Delete this part?')) return;
    const res = await apiFetch(`/api/parts/${id}`, { method: 'DELETE' });
    if (res?.ok) { loadParts(); showToast('Part deleted'); }
    else { alert('Failed to delete'); }
}

// ── Modal ─────────────────────────────────────────────────────────────────
function showModal(id) {
    document.getElementById(id).classList.add('open');
    if (id === 'addWorkOrderModal') loadCustomersForWO();
}
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ── Toast notification ────────────────────────────────────────────────────
function showToast(msg) {
    let t = document.getElementById('toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'toast';
        t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1e3a5f;color:white;padding:12px 20px;border-radius:8px;font-size:14px;z-index:9999;box-shadow:0 4px 15px rgba(0,0,0,0.2);transition:opacity 0.3s';
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.opacity = '0'; }, 3000);
}

// ── Utilities ─────────────────────────────────────────────────────────────
function showError(id, msg) { const el = document.getElementById(id); if(el){el.textContent=msg;el.style.display='block';} }
function showSuccess(id, msg) { const el = document.getElementById(id); if(el){el.textContent=msg;el.style.display='block';} }
function clearFields(ids) { ids.forEach(id => { const el = document.getElementById(id); if(el) el.value=''; }); }

function statusClass(s) {
    return { NEW:'new', ASSIGNED:'assigned', IN_PROGRESS:'inprogress', ON_HOLD:'onhold', COMPLETED:'completed', CLOSED:'closed', CANCELLED:'cancelled' }[s] || 'new';
}
function formatStatus(s) {
    return { NEW:'New', ASSIGNED:'Assigned', IN_PROGRESS:'In Progress', ON_HOLD:'On Hold', COMPLETED:'Completed', CLOSED:'Closed', CANCELLED:'Cancelled' }[s] || s;
}
function formatDate(d) {
    if (!d) return '-';
    return new Date(d).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}
function isSlaWarning(d) {
    if (!d) return false;
    return new Date(d) < new Date(Date.now() + 2 * 60 * 60 * 1000);
}
