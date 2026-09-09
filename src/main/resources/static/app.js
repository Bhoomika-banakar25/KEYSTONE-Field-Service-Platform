const API = '';
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let userRole = localStorage.getItem('userRole') || '';

// Helper functions for progress indicator colors
function getProgressColor(status, step) {
    if (step === 'IN_PROGRESS') {
        if (['IN_PROGRESS', 'ON_HOLD'].includes(status)) return '#667eea';
        if (['COMPLETED', 'CLOSED'].includes(status)) return '#10b981';
        return '#f3f4f6';
    }
    return '#f3f4f6';
}

function getProgressShadow(status, step) {
    if (step === 'IN_PROGRESS') {
        if (['IN_PROGRESS', 'ON_HOLD'].includes(status)) return '#667eea';
        if (['COMPLETED', 'CLOSED'].includes(status)) return '#10b981';
        return '#d1d5db';
    }
    return '#d1d5db';
}

window.onload = () => {
    if (token && currentUser) {
        showDashboard();
    } else {
        showPage('homePage');
    }
};

function goToLogin() {
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginEmail').focus();
    
    const container = document.querySelector('.home-container');
    const panel = document.getElementById('splitLoginPanel');
    container.classList.add('split-mode');
    panel.classList.add('active');
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

        token = t;
        localStorage.setItem('token', token);
        userRole = actualRole;
        localStorage.setItem('userRole', userRole);
        currentUser = { email };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Clear form before showing dashboard
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        
        // Auto-redirect to appropriate dashboard based on role
        showDashboard();
    } catch(e) { showError('loginError', 'Cannot connect to server'); }
}

async function register() {
    const body = {
        userName:  document.getElementById('regName').value,
        userEmail: document.getElementById('regEmail').value,
        password:  document.getElementById('regPassword').value,
        phone:     document.getElementById('regPhone').value,
        companyName: 'Meridian',
        location:  document.getElementById('regLocation').value,
        role:      document.getElementById('regRole').value
    };
    if (!body.userName || !body.userEmail || !body.password || !body.location) { 
        showError('registerError', 'Please fill all required fields'); 
        return; 
    }
    try {
        const res = await fetch(`${API}/api/user_auth/register`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) { showError('registerError', data.message || 'Registration failed'); return; }
        
        // Clear form after successful registration
        document.getElementById('regName').value = '';
        document.getElementById('regEmail').value = '';
        document.getElementById('regPassword').value = '';
        document.getElementById('regPhone').value = '';
        document.getElementById('regLocation').value = '';
        
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
    document.getElementById('navUsers').style.display         = isManager ? '' : 'none';
    document.getElementById('navDispatchers').style.display   = isManager ? '' : 'none';
    document.getElementById('navTechTracking').style.display  = isDispatcher ? '' : 'none';
    document.getElementById('navTechDashboard').style.display = isTechnician ? '' : 'none';

    const addWoBtn   = document.getElementById('addWoBtn');
    const addPartBtn = document.getElementById('addPartBtn');
    if (addWoBtn)   addWoBtn.style.display   = (isManager || isDispatcher) ? '' : 'none';
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
    if (name === 'dispatchers')    loadDispatchers();
    if (name === 'technician-tracking') loadTechnicianTracking();
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
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading...</td></tr>';
    try {
        const res = await apiFetch('/api/customers');
        if (!res || !res.ok) { tbody.innerHTML = '<tr><td colspan="6" class="loading">No access</td></tr>'; return; }
        const data = await res.json();
        if (!data.length) { tbody.innerHTML = '<tr><td colspan="6" class="loading">No customers found</td></tr>'; return; }
        tbody.innerHTML = data.map(c => `
            <tr>
                <td>${c.id}</td>
                <td><strong>${c.contactPerson}</strong></td>
                <td>${c.email}</td>
                <td>${c.phone}</td>
                <td><span class="badge badge-active">${c.active ? 'Active' : 'Inactive'}</span></td>
                <td><button class="btn btn-sm btn-outline" onclick="viewSites(${c.id},'${c.name}')">📍 Sites</button></td>
            </tr>`).join('');
    } catch(e) { tbody.innerHTML = '<tr><td colspan="6" class="loading">Error loading</td></tr>'; }
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
                <thead><tr><th>ID</th><th>Address</th></tr></thead>
                <tbody>${sites.map(s => `<tr><td>${s.id}</td><td>${s.address}</td></tr>`).join('')}</tbody>
            </table>` : '<p style="color:#888;margin-bottom:16px">No sites registered yet</p>'}
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
                <td>${w.customer?.contactPerson || '-'}</td>
                <td style="font-size:12px">${w.assignedTo && w.assignedAt ? formatDate(w.assignedAt) : (w.createdAt ? formatDate(w.createdAt) : '-')}</td>
                <td style="display:flex;gap:6px;flex-wrap:wrap">
                    <button class="btn btn-sm btn-primary" onclick="viewWorkOrder(${w.id})">View</button>
                    ${w.assignedTo ? `<button class="btn btn-sm btn-success" style="background:#28a745;cursor:default;color:#fff;border:none" disabled>✓ ${w.assignedTo.userName}</button>` : ((['MANAGER','ADMIN','DISPATCHER'].includes(userRole) && w.status !== 'CLOSED' && w.status !== 'CANCELLED') ? `<button class="btn btn-sm btn-warning" onclick="openAssignModal(${w.id})">👷 Assign</button>` : '')}
                </td>
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
    try {
        // Determine which endpoint to call based on user role
        const endpoint = userRole === 'CUSTOMER' ? `/api/portal/order/${id}` : `/api/work-orders/${id}`;
        
        const woRes = await apiFetch(endpoint);
        if (!woRes || !woRes.ok) {
            console.error('Failed to load work order. Status:', woRes?.status);
            return;
        }
        const wo = await apiFetch(endpoint);
        if (!wo || !wo.ok) return;
        const wo_data = await wo.json();
        
        const histRes = await apiFetch(`/api/work-orders/${id}/history`).catch(() => null);
        
        // For customers, fetch feedback from portal endpoint; for others, from regular endpoint
        let feedbackRes;
        if (userRole === 'CUSTOMER') {
            feedbackRes = await apiFetch(`/api/portal/feedback/${id}`).catch(() => null);
        } else {
            feedbackRes = await apiFetch(`/api/work-orders/${id}/feedback`).catch(() => null);
        }
        
        const history  = histRes && histRes.ok ? await histRes.json().catch(() => []) : [];
        let feedback   = [];
        
        if (feedbackRes && feedbackRes.ok) {
            const feedbackData = await feedbackRes.json().catch(() => null);
            console.log('Feedback data received:', feedbackData);
            // Handle both single feedback object and array of feedbacks
            feedback = feedbackData ? (Array.isArray(feedbackData) ? feedbackData : [feedbackData]) : [];
            console.log('Feedback array:', feedback);
        }
        
        // Check if technician is viewing their assigned work order
        const isTech = userRole === 'TECHNICIAN' && wo_data.assignedTo?.userEmail === currentUser?.email;
        const isCustomer = userRole === 'CUSTOMER';
        
        if (isTech) {
            // SPECIALIZED TECHNICIAN VIEW
            showTechnicianWorkOrderView(id, wo_data, history, feedback);
        } else if (isCustomer) {
            // CUSTOMER VIEW
            showCustomerWorkOrderView(id, wo_data, history, feedback);
        } else {
            // STANDARD VIEW (Manager, Dispatcher)
            showStandardWorkOrderView(id, wo_data, history, feedback);
        }
    } catch(e) {
        console.error('Error loading work order:', e);
    }
}

function showTechnicianWorkOrderView(id, wo, history, feedback) {
    const canLogWork = true;
    const customer = wo.customer || {};
    const site = wo.site || {};
    
    // Define technician workflow: ASSIGNED -> ACCEPT -> IN_PROGRESS -> COMPLETED
    let techStatusButtons = '';
    if (wo.status === 'ASSIGNED') {
        techStatusButtons = `
            <div style="background:linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);border:2px solid #3b82f6;border-radius:10px;padding:14px;margin-bottom:12px">
                <p style="color:#1e40af;font-weight:700;margin:0 0 12px 0;font-size:13px">🔧 Ready to Start?</p>
                <button style="width:100%;padding:12px;background:linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);color:white;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:14px;transition:all 0.3s;box-shadow:0 4px 12px rgba(59, 130, 246, 0.3)" onclick="transitionTechWorkflow(${id}, 'IN_PROGRESS', 'Accepted and starting work')" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 16px rgba(59, 130, 246, 0.4)'" onmouseout="this.style.transform='translateY(0)'">✓ Accept & Start Work</button>
            </div>`;
    } else if (wo.status === 'IN_PROGRESS') {
        techStatusButtons = `
            <div style="background:linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);border:2px solid #f59e0b;border-radius:10px;padding:14px;margin-bottom:12px">
                <p style="color:#92400e;font-weight:700;margin:0 0 12px 0;font-size:13px">⏳ Work in Progress</p>
                <div style="display:flex;gap:8px;flex-wrap:wrap">
                    <button style="flex:1;padding:12px;background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%);color:white;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px;transition:all 0.3s" onclick="transitionTechWorkflow(${id}, 'ON_HOLD', 'Work on hold')" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">⏸ Hold</button>
                    <button style="flex:1;padding:12px;background:linear-gradient(135deg, #10b981 0%, #059669 100%);color:white;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px;transition:all 0.3s" onclick="transitionTechWorkflow(${id}, 'COMPLETED', 'Work completed')" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">✓ Complete</button>
                </div>
            </div>`;
    } else if (wo.status === 'ON_HOLD') {
        techStatusButtons = `
            <div style="background:linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);border:2px solid #a855f7;border-radius:10px;padding:14px;margin-bottom:12px">
                <p style="color:#6b21a8;font-weight:700;margin:0 0 12px 0;font-size:13px">⏸ On Hold</p>
                <button style="width:100%;padding:12px;background:linear-gradient(135deg, #a855f7 0%, #9333ea 100%);color:white;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:14px;transition:all 0.3s" onclick="transitionTechWorkflow(${id}, 'IN_PROGRESS', 'Resuming work')" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">▶ Resume Work</button>
            </div>`;
    } else if (wo.status === 'COMPLETED') {
        techStatusButtons = `
            <div style="background:linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);border:2px solid #10b981;border-radius:10px;padding:14px;margin-bottom:12px">
                <p style="color:#065f46;font-weight:700;margin:0;font-size:13px">✓ Work Completed</p>
                <p style="color:#047857;font-size:12px;margin:8px 0 0 0;font-weight:600">Awaiting manager review</p>
            </div>`;
    }

    document.getElementById('woDetailTitle').textContent = wo.code + ' — ' + wo.title;
    document.getElementById('woDetailContent').innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;min-height:650px;background:linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);padding:20px;border-radius:12px">
            <!-- LEFT SIDE: CUSTOMER DETAILS & INFO -->
            <div style="overflow-y:auto;padding-right:12px">
                <!-- CUSTOMER CARD -->
                <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);border-radius:12px;padding:18px;margin-bottom:16px;color:white;box-shadow:0 4px 15px rgba(102, 126, 234, 0.2)">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
                        <div style="font-size:32px">🏢</div>
                        <div>
                            <p style="font-size:12px;opacity:0.9;margin:0">Customer Details</p>
                            <h3 style="margin:4px 0 0 0;font-size:18px">${customer.companyName || 'Not specified'}</h3>
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px">
                        <div style="background:rgba(255,255,255,0.15);border-radius:8px;padding:12px">
                            <p style="margin:0 0 6px 0;opacity:0.8;font-size:11px">Phone</p>
                            <p style="margin:0;font-weight:600">${customer.phone || '—'}</p>
                        </div>
                        <div style="background:rgba(255,255,255,0.15);border-radius:8px;padding:12px">
                            <p style="margin:0 0 6px 0;opacity:0.8;font-size:11px">Email</p>
                            <p style="margin:0;font-weight:600">${customer.email || '—'}</p>
                        </div>
                        <div style="grid-column:1/-1;background:rgba(255,255,255,0.15);border-radius:8px;padding:12px">
                            <p style="margin:0 0 6px 0;opacity:0.8;font-size:11px">📍 Location</p>
                            <p style="margin:0;font-weight:600">${site.address || site.name || '—'}</p>
                        </div>
                    </div>
                </div>

                <!-- WORK DETAILS CARD -->
                <div style="background:white;border-radius:12px;padding:18px;box-shadow:0 2px 12px rgba(0,0,0,0.08);border-left:5px solid #667eea">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
                        <div style="font-size:24px">📋</div>
                        <h4 style="margin:0;color:#1e3a5f;font-size:15px;font-weight:700">Work Details</h4>
                    </div>
                    <div style="font-size:13px;display:grid;gap:12px">
                        <div>
                            <span style="color:#667eea;font-size:11px;font-weight:700;text-transform:uppercase">Work Order ID</span>
                            <p style="margin:6px 0 0 0;color:#1e3a5f;font-weight:700;font-size:14px">${wo.code}</p>
                        </div>
                        <div>
                            <span style="color:#667eea;font-size:11px;font-weight:700;text-transform:uppercase">Priority Level</span>
                            <p style="margin:6px 0 0 0"><span class="badge badge-${wo.priority?.toLowerCase()}" style="font-weight:700;padding:6px 12px;border-radius:20px">${wo.priority}</span></p>
                        </div>
                        <div>
                            <span style="color:#667eea;font-size:11px;font-weight:700;text-transform:uppercase">Issue Title</span>
                            <p style="margin:6px 0 0 0;color:#333;font-weight:600">${wo.title}</p>
                        </div>
                        <div>
                            <span style="color:#667eea;font-size:11px;font-weight:700;text-transform:uppercase">Description</span>
                            <p style="margin:6px 0 0 0;color:#555;font-size:12px;line-height:1.5">${wo.description || 'No description provided'}</p>
                        </div>
                        ${wo.problemPhoto ? `<div style="margin-top:12px"><img src="${wo.problemPhoto}" style="max-width:100%;height:auto;border-radius:10px;border:2px solid #667eea;box-shadow:0 4px 12px rgba(102, 126, 234, 0.15)"></div>` : ''}
                    </div>
                </div>
            </div>

            <!-- RIGHT SIDE: ACTIONS & PROGRESS -->
            <div style="overflow-y:auto;padding-left:12px">
                <!-- ACTION BUTTONS CARD -->
                <div style="background:white;border-radius:12px;padding:18px;margin-bottom:16px;box-shadow:0 2px 12px rgba(0,0,0,0.08);border-left:5px solid #f59e0b">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
                        <div style="font-size:24px">⚡</div>
                        <h4 style="margin:0;color:#1e3a5f;font-size:15px;font-weight:700">Take Action</h4>
                    </div>
                    <div style="display:grid;gap:10px">
                        ${techStatusButtons}
                        <button class="btn btn-sm" style="width:100%;padding:12px;background:linear-gradient(135deg, #f59e0b 0%, #f97316 100%);color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;transition:all 0.3s" onclick="openFeedbackModal(${id})" onmouseover="this.style.transform='translateY(-2px);this.style.boxShadow='0 6px 16px rgba(245, 158, 11, 0.3)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none'">⭐ View Customer Feedback</button>
                    </div>
                </div>

                <!-- PROGRESS TRACKER CARD -->
                <div style="background:white;border-radius:12px;padding:18px;box-shadow:0 2px 12px rgba(0,0,0,0.08);border-left:5px solid #10b981">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
                        <div style="font-size:24px">📊</div>
                        <h4 style="margin:0;color:#1e3a5f;font-size:15px;font-weight:700">Work Progress</h4>
                    </div>
                    
                    <!-- THIN LINE PROGRESS BAR WITH TIMELINE -->
                    <div style="margin-bottom:20px">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;position:relative">
                            <!-- Connecting line -->
                            <div style="position:absolute;top:12px;left:0;right:0;height:2px;background:#e5e7eb;z-index:0"></div>
                            
                            <!-- NEW -->
                            <div style="display:flex;flex-direction:column;align-items:center;position:relative;z-index:1;flex:1">
                                <div style="width:24px;height:24px;border-radius:50%;background:${wo.status !== 'NEW' ? '#10b981' : '#f3f4f6'};border:3px solid white;box-shadow:0 0 0 2px ${wo.status !== 'NEW' ? '#10b981' : '#d1d5db'};margin-bottom:8px"></div>
                                <span style="font-size:11px;font-weight:700;color:#667eea;text-align:center">NEW</span>
                            </div>
                            
                            <!-- ASSIGNED -->
                            <div style="display:flex;flex-direction:column;align-items:center;position:relative;z-index:1;flex:1">
                                <div style="width:24px;height:24px;border-radius:50%;background:${['ASSIGNED','IN_PROGRESS','ON_HOLD','COMPLETED','CLOSED'].includes(wo.status) ? '#10b981' : '#f3f4f6'};border:3px solid white;box-shadow:0 0 0 2px ${['ASSIGNED','IN_PROGRESS','ON_HOLD','COMPLETED','CLOSED'].includes(wo.status) ? '#10b981' : '#d1d5db'};margin-bottom:8px"></div>
                                <span style="font-size:11px;font-weight:700;color:#667eea;text-align:center">ASSIGNED</span>
                            </div>
                            
                            <!-- IN PROGRESS -->
                            <div style="display:flex;flex-direction:column;align-items:center;position:relative;z-index:1;flex:1">
                                <div style="width:24px;height:24px;border-radius:50%;background:${getProgressColor(wo.status, 'IN_PROGRESS')};border:3px solid white;box-shadow:0 0 0 2px ${getProgressShadow(wo.status, 'IN_PROGRESS')};margin-bottom:8px"></div>
                                <span style="font-size:11px;font-weight:700;color:#667eea;text-align:center">IN PROGRESS</span>
                            </div>
                            
                            <!-- COMPLETED -->
                            <div style="display:flex;flex-direction:column;align-items:center;position:relative;z-index:1;flex:1">
                                <div style="width:24px;height:24px;border-radius:50%;background:${['COMPLETED','CLOSED'].includes(wo.status) ? '#10b981' : '#f3f4f6'};border:3px solid white;box-shadow:0 0 0 2px ${['COMPLETED','CLOSED'].includes(wo.status) ? '#10b981' : '#d1d5db'};margin-bottom:8px"></div>
                                <span style="font-size:11px;font-weight:700;color:#667eea;text-align:center">COMPLETED</span>
                            </div>
                        </div>
                    </div>

                    ${feedback && feedback.length > 0 ? `
                    <div style="background:linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);border:2px solid #10b981;border-radius:10px;padding:14px;margin-top:16px">
                        <p style="color:#047857;font-size:13px;font-weight:700;margin:0 0 12px 0;display:flex;align-items:center;gap:8px">⭐ Customer Feedback</p>
                        ${feedback.map((f, i) => `
                        <div style="border-bottom:${i < feedback.length - 1 ? '1px solid rgba(16, 185, 129, 0.2)' : 'none'};padding-bottom:${i < feedback.length - 1 ? '10px' : '0'};margin-bottom:${i < feedback.length - 1 ? '10px' : '0'};font-size:12px">
                            <div style="color:#f59e0b;font-size:14px;letter-spacing:2px;margin-bottom:6px">${'★'.repeat(f.rating)}${'☆'.repeat(5 - f.rating)}</div>
                            <p style="margin:0;color:#1f2937;line-height:1.5">${f.comment || 'No comment provided'}</p>
                        </div>
                        `).join('')}
                    </div>` : `<div style="background:linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);border:2px dashed #d1d5db;border-radius:10px;padding:14px;text-align:center;margin-top:16px"><p style="color:#6b7280;font-size:12px;margin:0">No feedback yet</p></div>`}
                </div>
            </div>
        </div>`;

    showModal('woDetailModal');
    if (wo.status === 'IN_PROGRESS') loadPartsDropdown();
}


function showCustomerWorkOrderView(id, wo, history, feedback) {
    const customer = wo.customer || {};
    const site = wo.site || {};
    const assignedTech = wo.assignedTo || null;
    console.log('showCustomerWorkOrderView called with feedback:', feedback);
    
    document.getElementById('woDetailTitle').textContent = wo.code + ' — ' + wo.title;
    document.getElementById('woDetailContent').innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;background:linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);padding:20px;border-radius:12px">
            <!-- COLUMN 1: WORK DETAILS -->
            <div style="overflow-y:auto;padding-right:8px">
                <div style="background:white;border-radius:12px;padding:16px;box-shadow:0 2px 12px rgba(0,0,0,0.08);border-left:5px solid #667eea">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
                        <div style="font-size:20px">📋</div>
                        <h4 style="margin:0;color:#1e3a5f;font-size:14px;font-weight:700">Work Details</h4>
                    </div>
                    <div style="font-size:12px;color:#555;line-height:1.7">
                        <p style="margin:0 0 10px 0"><strong>Priority:</strong> <span class="badge badge-${wo.priority?.toLowerCase()}">${wo.priority}</span></p>
                        <p style="margin:0 0 10px 0"><strong>Status:</strong> <span class="badge badge-${statusClass(wo.status)}">${formatStatus(wo.status)}</span></p>
                        <p style="margin:0 0 10px 0"><strong>Location:</strong> ${site.name || '—'}</p>
                        <p style="margin:0 0 8px 0"><strong>Description:</strong></p>
                        <p style="margin:4px 0 0 0;color:#666;background:#f9f9f9;padding:8px;border-radius:4px;border-left:3px solid #667eea;font-size:11px;line-height:1.4">${wo.description || '—'}</p>
                        ${wo.problemPhoto ? `<div style="margin-top:10px"><img src="${wo.problemPhoto}" style="max-width:100%;height:auto;border-radius:8px;border:2px solid #667eea;max-height:150px;object-fit:cover"></div>` : ''}
                    </div>
                </div>

                <!-- ASSIGNED TECHNICIAN -->
                <div style="background:linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);border-radius:12px;padding:16px;margin-top:14px;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
                        <div style="font-size:20px">👷</div>
                        <h4 style="margin:0;color:#1b5e20;font-size:14px;font-weight:700">Assigned Tech</h4>
                    </div>
                    ${assignedTech ? `
                        <div style="background:white;border-radius:6px;padding:10px;font-size:11px">
                            <p style="margin:0 0 4px 0;color:#666"><strong>Name:</strong></p>
                            <p style="margin:0 0 8px 0;font-weight:600;color:#1b5e20">${assignedTech.userName}</p>
                            <p style="margin:0 0 4px 0;color:#666"><strong>Email:</strong></p>
                            <p style="margin:0;font-weight:600;color:#1b5e20;word-break:break-all">${assignedTech.userEmail}</p>
                        </div>
                    ` : `<p style="color:#666;text-align:center;padding:12px;font-size:12px">Not assigned</p>`}
                </div>
            </div>

            <!-- COLUMN 2: WORK PROGRESS -->
            <div>
                <div style="background:white;border-radius:12px;padding:16px;box-shadow:0 2px 12px rgba(0,0,0,0.08);border-left:5px solid #10b981;height:100%">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
                        <div style="font-size:20px">📊</div>
                        <h4 style="margin:0;color:#1e3a5f;font-size:14px;font-weight:700">Work Progress</h4>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;height:calc(100% - 50px)">
                        <div style="position:relative;width:100%;height:3px;background:#e5e7eb;border-radius:2px;margin:8px 0"></div>
                        <div style="display:grid;grid-template-columns:1fr;gap:8px;width:100%">
                            <div style="display:flex;flex-direction:column;align-items:center">
                                <div style="width:20px;height:20px;border-radius:50%;background:${wo.status !== 'NEW' ? '#10b981' : '#f3f4f6'};border:3px solid white;box-shadow:0 0 0 2px ${wo.status !== 'NEW' ? '#10b981' : '#d1d5db'};margin-bottom:6px"></div>
                                <span style="font-size:10px;font-weight:700;color:#667eea">NEW</span>
                            </div>
                            <div style="display:flex;flex-direction:column;align-items:center">
                                <div style="width:20px;height:20px;border-radius:50%;background:${['ASSIGNED','IN_PROGRESS','ON_HOLD','COMPLETED','CLOSED'].includes(wo.status) ? '#10b981' : '#f3f4f6'};border:3px solid white;box-shadow:0 0 0 2px ${['ASSIGNED','IN_PROGRESS','ON_HOLD','COMPLETED','CLOSED'].includes(wo.status) ? '#10b981' : '#d1d5db'};margin-bottom:6px"></div>
                                <span style="font-size:10px;font-weight:700;color:#667eea">ASSIGNED</span>
                            </div>
                            <div style="display:flex;flex-direction:column;align-items:center">
                                <div style="width:20px;height:20px;border-radius:50%;background:${['IN_PROGRESS','ON_HOLD','COMPLETED','CLOSED'].includes(wo.status) ? (wo.status === 'IN_PROGRESS' || wo.status === 'ON_HOLD' ? '#667eea' : '#10b981') : '#f3f4f6'};border:3px solid white;box-shadow:0 0 0 2px ${['IN_PROGRESS','ON_HOLD','COMPLETED','CLOSED'].includes(wo.status) ? (wo.status === 'IN_PROGRESS' || wo.status === 'ON_HOLD' ? '#667eea' : '#10b981') : '#d1d5db'};margin-bottom:6px"></div>
                                <span style="font-size:10px;font-weight:700;color:#667eea">IN PROG</span>
                            </div>
                            <div style="display:flex;flex-direction:column;align-items:center">
                                <div style="width:20px;height:20px;border-radius:50%;background:${['COMPLETED','CLOSED'].includes(wo.status) ? '#10b981' : '#f3f4f6'};border:3px solid white;box-shadow:0 0 0 2px ${['COMPLETED','CLOSED'].includes(wo.status) ? '#10b981' : '#d1d5db'};margin-bottom:6px"></div>
                                <span style="font-size:10px;font-weight:700;color:#667eea">COMPLETE</span>
                            </div>
                        </div>
                        <div style="margin-top:12px;text-align:center;font-size:12px;color:#666;font-weight:600">
                            Current: <br><span class="badge badge-${statusClass(wo.status)}">${formatStatus(wo.status)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- COLUMN 3: FEEDBACK ONLY -->
            <div style="overflow-y:auto;padding-left:8px">
                <!-- FEEDBACK -->
                <div style="background:linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);border:2px solid #10b981;border-radius:10px;padding:14px;min-height:100px;display:flex;flex-direction:column;justify-content:center">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
                        <div style="font-size:20px">⭐</div>
                        <h4 style="margin:0;color:#047857;font-size:14px;font-weight:700">Your Feedback</h4>
                    </div>
                    ${feedback && feedback.length > 0 ? feedback.map((f, i) => `
                    <div style="border-top:${i > 0 ? '1px solid rgba(16, 185, 129, 0.2)' : 'none'};padding-top:${i > 0 ? '10px' : '0'};margin-top:${i > 0 ? '10px' : '0'};font-size:11px">
                        <div style="color:#f59e0b;font-size:13px;letter-spacing:0.5px;margin-bottom:6px">${'★'.repeat(f.rating)}${'☆'.repeat(5-f.rating)}</div>
                        <p style="margin:0 0 6px 0;color:#1f2937;line-height:1.5;font-size:11px;word-wrap:break-word">${f.comment || '(No comment)'}</p>
                        ${f.feedbackPhoto ? `<img src="${f.feedbackPhoto}" style="max-width:100%;max-height:100px;border-radius:4px;margin-top:6px;object-fit:cover;border:1px solid rgba(16, 185, 129, 0.3)">` : ''}
                    </div>
                    `).join('') : `<p style="color:#059669;font-size:12px;font-style:italic;margin:0">No feedback submitted yet</p>`}
                </div>
            </div>
        </div>`;

    showModal('woDetailModal');
}

function showStandardWorkOrderView(id, wo, history, feedback) {
    const transitions = getAvailableTransitions(wo.status);
    const canAssign  = ['MANAGER','ADMIN','DISPATCHER'].includes(userRole);
    const canLogWork = ['TECHNICIAN','EMPLOYEE','MANAGER','ADMIN'].includes(userRole);

    document.getElementById('woDetailTitle').textContent = wo.code + ' — ' + wo.title;
    document.getElementById('woDetailContent').innerHTML = `
        <div class="detail-grid">
            <div class="detail-item"><label>Status</label><span class="badge badge-${statusClass(wo.status)}">${formatStatus(wo.status)}</span></div>
            <div class="detail-item"><label>Priority</label><span class="badge badge-${wo.priority?.toLowerCase()}">${wo.priority}</span></div>
            <div class="detail-item"><label>Customer</label><span>${wo.customer?.contactPerson || '-'}</span></div>
            <div class="detail-item"><label>Site</label><span>${wo.site?.name || '-'}</span></div>
            <div class="detail-item"><label>Assigned To</label><span>${wo.assignedTo?.userName || '— Not assigned —'}</span></div>
            <div class="detail-item"><label>Created</label><span>${wo.createdAt ? formatDate(wo.createdAt) : '-'}</span></div>
            <div class="detail-item" style="grid-column:1/-1"><label>Description</label><span>${wo.description || '—'}</span></div>
            ${wo.problemPhoto ? `<div class="detail-item" style="grid-column:1/-1"><label>Problem Photo</label><br><img src="${wo.problemPhoto}" style="max-width:100%;max-height:300px;border-radius:8px;margin-top:8px;border:1px solid #ddd"></div>` : ''}
        </div>
        ${transitions.length ? `<div class="transition-buttons"><strong style="font-size:13px;color:#555;margin-right:8px">Change Status:</strong>${transitions.map(t => `<button class="btn btn-sm ${t.cls}" onclick="transition(${id},'${t.status}')">${t.label}</button>`).join('')}</div>` : ''}
        ${feedback && feedback.length > 0 ? `
        <div style="padding:16px 24px;border-top:1px solid #f0f0f0;background:#f9fff9;border-radius:0 0 8px 8px">
            <h4 style="color:#2e7d32;margin-bottom:15px">⭐ Customer Feedback (${feedback.length})</h4>
            ${feedback.map((f, i) => `
            <div style="margin-bottom:${i < feedback.length - 1 ? '15px;padding-bottom:15px;border-bottom:1px solid #e0e0e0' : '0'}">
                <div style="display:flex;gap:6px;margin-bottom:8px">${'★'.repeat(f.rating)}${'☆'.repeat(5 - f.rating)}</div>
                <p style="color:#333;margin-bottom:8px">${f.comment || 'No comment'}</p>
                ${f.feedbackPhoto ? `<img src="${f.feedbackPhoto}" style="max-width:100%;max-height:220px;border-radius:8px;border:1px solid #ddd;margin-bottom:8px">` : ''}
                <p style="font-size:12px;color:#888">${formatDate(f.submittedAt)}</p>
            </div>
            `).join('')}
        </div>` : ''}
        <div class="history-table">
            <h4>Status History</h4>
            ${history.length ? `
            <table class="data-table">
                <thead><tr><th>Status</th><th>By</th><th>When</th><th>Note</th></tr></thead>
                <tbody>${history.map(h => `<tr><td><span class="badge badge-${statusClass(h.toStatus)}">${formatStatus(h.toStatus)}</span></td><td style="font-size:12px">${h.changedBy||'-'}</td><td style="font-size:12px">${formatDate(h.changedAt)}</td><td style="font-size:12px">${h.note||'-'}</td></tr>`).join('')}</tbody>
            </table>` : '<p style="color:#888;font-size:13px">No history yet</p>'}
        </div>`;

    showModal('woDetailModal');
}

async function loadPartsDropdown() {
    const sel = document.getElementById('partSelect');
    if (!sel) return;
    const res = await apiFetch('/api/parts');
    if (!res || !res.ok) return;
    const parts = await res.json();
    sel.innerHTML = '<option value="">Select part...</option>' + parts.map(p => `<option value="${p.id}">${p.name} (Stock: ${p.stockQty})</option>`).join('');
}

async function transition(id, status) {
    const note = prompt(`Note for: ${formatStatus(status)} (optional):`) || '';
    const res = await apiFetch(`/api/work-orders/${id}/status`, { method: 'POST', body: JSON.stringify({ status, note }) });
    if (res?.ok) { closeModal('woDetailModal'); loadWorkOrders(); showToast('Status updated to ' + formatStatus(status)); }
    else { const e = await res?.text(); alert('Not allowed: ' + (e || 'Invalid transition')); }
}

async function transitionTechWorkflow(id, status, defaultNote) {
    const note = prompt(`Note for ${formatStatus(status)} (optional):`, defaultNote) || defaultNote || '';
    const res = await apiFetch(`/api/work-orders/${id}/status`, { method: 'POST', body: JSON.stringify({ status, note }) });
    if (res?.ok) { 
        closeModal('woDetailModal'); 
        loadTechDashboard(); 
        showToast('✓ Completed Successfully'); 
    } else { 
        const e = await res?.text(); 
        alert('Status update failed: ' + (e || 'Invalid transition')); 
    }
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
        'NEW':         [...(isDis ? [{ status:'ASSIGNED', label:'Assign', cls:'btn-warning' }] : [])],
        'ASSIGNED':    [...(isTech ? [{ status:'IN_PROGRESS', label:'▶ Start Work', cls:'btn-success' }] : [])],
        'IN_PROGRESS': [...(isTech ? [{ status:'ON_HOLD', label:'⏸ Hold', cls:'btn-warning' }] : []), ...(isTech ? [{ status:'COMPLETED', label:'✓ Complete', cls:'btn-success' }] : [])],
        'ON_HOLD':     [...(isTech ? [{ status:'IN_PROGRESS', label:'▶ Resume', cls:'btn-success' }] : [])],
        'COMPLETED':   [...(isMgr ? [{ status:'CLOSED', label:'✓ Close', cls:'btn-primary' }] : [])],
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
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Loading your requests...</td></tr>';
    try {
        const res = await apiFetch('/api/portal/my-orders');
        if (!res || !res.ok) {
            tbody.innerHTML = '<tr><td colspan="5" class="loading">No requests yet. Click Raise New Request to submit one.</td></tr>';
            document.getElementById('portalWelcome').innerHTML = `
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:14px">
                    <span style="font-size:18px;font-weight:700;color:#1e3a5f">Your Requests:</span>
                    <span style="font-size:22px;font-weight:800;color:#2d6a9f">0</span>
                </div>`;
            await loadPortalSites();
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

        if (!data.length) { tbody.innerHTML = '<tr><td colspan="5" class="loading">No requests yet. Click Raise New Request to submit one.</td></tr>'; }
        else {
            tbody.innerHTML = data.map(w => `
            <tr>
                <td><strong>${w.code}</strong></td>
                <td>${w.title}</td>
                <td><span class="badge badge-${w.priority?.toLowerCase()}">${w.priority}</span></td>
                <td><span class="badge badge-${statusClass(w.status)}">${customerStatusLabel(w.status)}</span></td>
                <td style="display:flex;gap:6px">
                    ${(w.status !== 'COMPLETED' && w.status !== 'CLOSED') ? `<button class="btn btn-sm btn-outline" onclick="viewWorkOrder(${w.id})">View</button>` : ''}
                    ${(w.status === 'COMPLETED' || w.status === 'CLOSED') ? `
                        <button class="btn btn-sm btn-outline" onclick="viewWorkOrder(${w.id})">View</button>
                        <button class="btn btn-sm btn-success" onclick="openFeedbackModal(${w.id})">⭐ Feedback</button>
                    ` : ''}
                </td>
            </tr>`).join('');
        }
        await loadPortalSites();
    } catch(e) { tbody.innerHTML = '<tr><td colspan="5" class="loading">Error loading</td></tr>'; }
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
    const manualInput = document.getElementById('reqManualAddress');
    if (sel) {
        if (sites.length) {
            sel.innerHTML = '<option value="">Select site...</option>' + sites.map(s => `<option value="${s.id}">${s.address}</option>`).join('');
            sel.style.display = '';
            if (manualInput) manualInput.style.display = 'none';
        } else {
            sel.innerHTML = '<option value="new">+ Enter address manually</option>';
            sel.style.display = '';
            if (manualInput) manualInput.style.display = 'block';
        }
    }
}

function toggleManualAddress(sel) {
    const manualInput = document.getElementById('reqManualAddress');
    if (!manualInput) return;
    manualInput.style.display = (sel.value === 'new' || sel.value === '') ? 'block' : 'none';
}

async function raiseRequest() {
    const photoInput = document.getElementById('reqPhoto');
    let problemPhoto = '';
    if (photoInput && photoInput.files && photoInput.files[0]) {
        problemPhoto = await toBase64(photoInput.files[0]);
    }

    let siteId = document.getElementById('reqSite').value;
    const manualAddress = document.getElementById('reqManualAddress')?.value?.trim();

    if (siteId === 'new' || siteId === '') {
        if (!manualAddress) { showError('reqError', 'Please enter your address'); return; }
        const siteRes = await apiFetch('/api/portal/add-site', {
            method: 'POST',
            body: JSON.stringify({ name: 'Main Location', address: manualAddress })
        });
        if (!siteRes || !siteRes.ok) { showError('reqError', 'Failed to save your address. Try again.'); return; }
        const newSite = await siteRes.json();
        siteId = newSite.id;
    }

    const body = {
        title:        document.getElementById('reqTitle').value,
        description:  document.getElementById('reqDesc').value,
        priority:     document.getElementById('reqPriority').value,
        siteId:       siteId,
        problemPhoto: problemPhoto
    };
    if (!body.title || !siteId) { showError('reqError', 'Title and site are required'); return; }
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
        // Filter to show only TECHNICIAN role, not DISPATCHER
        const technicians = data.filter(u => u.role === 'TECHNICIAN');
        if (!technicians.length) { tbody.innerHTML = '<tr><td colspan="6" class="loading">No technicians added yet. Click Add Technician to create accounts.</td></tr>'; return; }
        tbody.innerHTML = technicians.map(u => `
            <tr>
                <td>${u.id}</td>
                <td><strong>${u.userName}</strong></td>
                <td>${u.userEmail}</td>
                <td><span class="badge" style="background:#fff3e0;color:#e65100">${u.role}</span></td>
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

// DISPATCHER MANAGEMENT FUNCTIONS
async function loadDispatchers() {
    const tbody = document.getElementById('dispatchersTable');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading...</td></tr>';
    try {
        const res = await apiFetch('/api/users/dispatchers');
        if (!res || !res.ok) { tbody.innerHTML = '<tr><td colspan="6" class="loading">No access</td></tr>'; return; }
        const data = await res.json();
        if (!data.length) { tbody.innerHTML = '<tr><td colspan="6" class="loading">No dispatchers added yet. Click Add Dispatcher to create accounts.</td></tr>'; return; }
        tbody.innerHTML = data.map(u => `
            <tr>
                <td>${u.id}</td>
                <td><strong>${u.userName}</strong></td>
                <td>${u.userEmail}</td>
                <td>${u.phone || '-'}</td>
                <td><span class="badge" style="background:#e8f5e9;color:#2e7d32">Active</span></td>
                <td><button class="btn btn-sm btn-danger" onclick="deleteDispatcher(${u.id}, '${u.userName}')">Remove</button></td>
            </tr>`).join('');
    } catch(e) { tbody.innerHTML = '<tr><td colspan="6" class="loading">Error loading</td></tr>'; }
}

async function addDispatcher() {
    const body = {
        userName: document.getElementById('dispatcherName').value,
        userEmail: document.getElementById('dispatcherEmail').value,
        password: document.getElementById('dispatcherPassword').value,
        phone: document.getElementById('dispatcherPhone').value,
        role: 'DISPATCHER'
    };
    if (!body.userName || !body.userEmail || !body.password) { showError('dispatcherError', 'Name, email and password are required'); return; }
    const res = await apiFetch('/api/users/staff', { method: 'POST', body: JSON.stringify(body) });
    if (res?.ok) {
        closeModal('addDispatcherModal');
        clearFields(['dispatcherName','dispatcherEmail','dispatcherPassword','dispatcherPhone']);
        loadDispatchers();
        showToast('Dispatcher account created for ' + body.userEmail);
    } else {
        const e = await res?.text();
        showError('dispatcherError', e || 'Failed to create dispatcher');
    }
}

async function deleteDispatcher(id, name) {
    if (!confirm(`Remove ${name} from the system?`)) return;
    const res = await apiFetch(`/api/users/staff/${id}`, { method: 'DELETE' });
    if (res?.ok) { loadDispatchers(); showToast(`${name} removed`); }
    else { alert('Failed to remove dispatcher'); }
}

async function loadTechnicianTracking() {
    const container = document.getElementById('technicianTrackingContainer');
    container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#999">Loading technician data...</div>';
    try {
        const res = await apiFetch('/api/reports/technicians-tracking');
        if (!res || !res.ok) {
            container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#d32f2f">Failed to load technician tracking data</div>';
            return;
        }
        const technicians = await res.json();
        if (!technicians || technicians.length === 0) {
            container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#999">No technicians available</div>';
            return;
        }
        
        container.innerHTML = technicians.map(tech => `
            <div style="background:white;border-radius:12px;padding:20px;box-shadow:0 2px 10px rgba(0,0,0,0.08);border-left:5px solid #667eea;transition:all 0.3s">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
                    <div style="width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:18px">
                        ${tech.name.charAt(0).toUpperCase()}
                    </div>
                    <div style="flex:1;min-width:0">
                        <h4 style="margin:0 0 4px 0;color:#1e3a5f;font-size:15px;font-weight:700;word-break:break-word">${tech.name}</h4>
                        <p style="margin:0;color:#666;font-size:12px;word-break:break-all">${tech.email}</p>
                    </div>
                </div>
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:0">
                    <div style="background:linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);border-radius:8px;padding:14px;text-align:center;border-left:4px solid #2196f3">
                        <div style="font-size:24px;font-weight:700;color:#1565c0">${tech.assigned}</div>
                        <div style="font-size:12px;color:#1565c0;font-weight:600;margin-top:4px">Assigned</div>
                    </div>
                    
                    <div style="background:linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);border-radius:8px;padding:14px;text-align:center;border-left:4px solid #9c27b0">
                        <div style="font-size:24px;font-weight:700;color:#6a1b9a">${tech.inProgress}</div>
                        <div style="font-size:12px;color:#6a1b9a;font-weight:600;margin-top:4px">In Progress</div>
                    </div>
                    
                    <div style="background:linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);border-radius:8px;padding:14px;text-align:center;border-left:4px solid #ff9800">
                        <div style="font-size:24px;font-weight:700;color:#e65100">${tech.onHold}</div>
                        <div style="font-size:12px;color:#e65100;font-weight:600;margin-top:4px">On Hold</div>
                    </div>
                    
                    <div style="background:linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);border-radius:8px;padding:14px;text-align:center;border-left:4px solid #4caf50">
                        <div style="font-size:24px;font-weight:700;color:#1b5e20">${tech.completed}</div>
                        <div style="font-size:12px;color:#1b5e20;font-weight:600;margin-top:4px">Completed</div>
                    </div>
                </div>
                
                <div style="display:flex;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid #e0e0e0;font-size:13px;color:#666">
                    <span style="flex:1"><strong>Total:</strong> <span style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-weight:700;color:#333">${tech.total}</span></span>
                    <span><strong>Completion:</strong> <span style="background:#f0f0f0;padding:2px 8px;border-radius:4px;font-weight:700;color:#333">${tech.total > 0 ? Math.round((tech.completed / tech.total) * 100) : 0}%</span></span>
                </div>
            </div>
        `).join('');
    } catch(e) {
        console.error('Error loading technician tracking:', e);
        container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#d32f2f">Error loading technician data</div>';
    }
}

function showModal(id) {
    document.getElementById(id).classList.add('open');
    if (id === 'addWorkOrderModal') loadCustomersForWO();
    if (id === 'addUserModal') {
        document.getElementById('addUserModal').querySelector('.modal-header h3').textContent = 'Add Technician';
        clearFields(['staffName','staffEmail','staffPassword','staffPhone']);
        document.getElementById('staffError').style.display = 'none';
        const roleSelect = document.getElementById('staffRole');
        if (userRole === 'DISPATCHER') {
            roleSelect.innerHTML = '<option value="TECHNICIAN">Technician</option>';
        } else {
            roleSelect.innerHTML = '<option value="TECHNICIAN">Technician</option><option value="DISPATCHER">Dispatcher</option>';
        }
    }
    if (id === 'addDispatcherModal') {
        clearFields(['dispatcherName','dispatcherEmail','dispatcherPassword','dispatcherPhone']);
        document.getElementById('dispatcherError').style.display = 'none';
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
                <td>${w.customer?.contactPerson || '-'}</td>
                <td><button class="btn btn-sm btn-primary" onclick="viewWorkOrder(${w.id})">View</button></td>
            </tr>`).join('');
    } catch(e) { tbody.innerHTML = '<tr><td colspan="6" class="loading">Error loading</td></tr>'; }
}

function openFeedbackModal(workOrderId) {
    // If technician, show customer feedback (read-only)
    if (userRole === 'TECHNICIAN' || userRole === 'EMPLOYEE') {
        showCustomerFeedbackModal(workOrderId);
    } else {
        // If customer, show feedback form
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
}

async function showCustomerFeedbackModal(workOrderId) {
    // Fetch customer feedback for this work order
    const res = await apiFetch(`/api/work-orders/${workOrderId}/feedback`);
    if (!res || !res.ok) {
        alert('Failed to load feedback');
        return;
    }
    
    const feedbackList = await res.json();
    
    // Create a read-only feedback view modal
    const feedbackHTML = feedbackList.length > 0 ? 
        feedbackList.map(f => `
            <div style="border:1px solid #e0e0e0;border-radius:8px;padding:16px;margin-bottom:12px;background:#f9f9f9">
                <div style="display:flex;gap:8px;margin-bottom:8px">
                    ${Array(f.rating).fill('★').join('')}${Array(5-f.rating).fill('☆').join('')}
                    <span style="color:#999;font-size:12px">${f.rating}/5</span>
                </div>
                <p style="margin:0 0 8px 0;color:#333;line-height:1.5">${f.comment || 'No comment provided'}</p>
                ${f.feedbackPhoto ? `<img src="${f.feedbackPhoto}" style="max-width:100%;max-height:250px;border-radius:6px;margin:8px 0">` : ''}
                <p style="margin:8px 0 0 0;font-size:12px;color:#999">${formatDate(f.submittedAt)}</p>
            </div>
        `).join('') : 
        '<p style="color:#999;text-align:center;padding:20px">No customer feedback yet</p>';
    
    // Show as alert or in a modal
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:5000';
    modal.innerHTML = `
        <div style="background:white;border-radius:12px;max-width:500px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,0.3)">
            <div style="padding:20px;border-bottom:1px solid #e0e0e0;display:flex;justify-content:space-between;align-items:center">
                <h3 style="margin:0;color:#1e3a5f">⭐ Customer Feedback</h3>
                <button style="background:none;border:none;font-size:24px;cursor:pointer;color:#999" onclick="this.parentElement.parentElement.parentElement.remove()">✕</button>
            </div>
            <div style="padding:20px">
                ${feedbackHTML}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
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
        showSuccess('feedbackSuccess', 'Feedback submitted! Thank you. Refreshing view...');
        setTimeout(() => { 
            closeModal('feedbackModal');
            viewWorkOrder(workOrderId);
            loadPortal();
            showToast('✓ Feedback submitted and view refreshed');
        }, 1500);
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


async function openAssignModal(workOrderId) {
    document.getElementById('assignModalWoId').value = workOrderId;
    document.getElementById('assignModalError').style.display = 'none';
    
    // Load technicians
    const res = await apiFetch('/api/users/technicians');
    if (!res || !res.ok) {
        showError('assignModalError', 'Failed to load technicians');
        return;
    }
    const techs = await res.json();
    const sel = document.getElementById('assignModalSelect');
    sel.innerHTML = '<option value="">Select a technician...</option>' + 
        techs.map(t => `<option value="${t.id}">${t.userName} (${t.userEmail})</option>`).join('');
    
    showModal('assignTechModal');
}

async function confirmAssign() {
    const workOrderId = document.getElementById('assignModalWoId').value;
    const technicianId = document.getElementById('assignModalSelect').value;
    
    if (!technicianId) {
        showError('assignModalError', 'Please select a technician');
        return;
    }
    
    const res = await apiFetch(`/api/work-orders/${workOrderId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ technicianId: parseInt(technicianId) })
    });
    
    if (res && res.ok) {
        closeModal('assignTechModal');
        loadWorkOrders();
        showToast('✓ Technician assigned successfully');
    } else {
        const err = await res?.text().catch(() => 'Failed to assign');
        showError('assignModalError', err || 'Failed to assign technician');
    }
}


function getProgressColor(status, step) {
    if (step === 'IN_PROGRESS') {
        if (['IN_PROGRESS', 'ON_HOLD'].includes(status)) return '#667eea';
        if (['COMPLETED', 'CLOSED'].includes(status)) return '#10b981';
        return '#f3f4f6';
    }
    return '#f3f4f6';
}

function getProgressShadow(status, step) {
    if (step === 'IN_PROGRESS') {
        if (['IN_PROGRESS', 'ON_HOLD'].includes(status)) return '#667eea';
        if (['COMPLETED', 'CLOSED'].includes(status)) return '#10b981';
        return '#d1d5db';
    }
    return '#d1d5db';
}

