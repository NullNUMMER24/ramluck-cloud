// dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
  await loadDashboardData();
  initCharts();
  setupEventListeners();
  centerHeaderText(); // New function to center the header text
});

async function loadDashboardData() {
  try {
    const [hosts, vms, users, apps] = await Promise.all([
      fetchData('/hosts'),
      fetchData('/vms'),
      fetchData('/users'),
      fetchData('/applications')
    ]);

    updateCounter('hosts-count', hosts.length);
    updateCounter('vms-count', vms.length);
    updateCounter('users-count', users.length);
    updateCounter('apps-count', apps.length);
    
    populateHostsTable(hosts);
    populateRecentActivity();
  } catch (error) {
    showToast('Error loading dashboard data', 'error');
  }
}

function updateCounter(elementId, count) {
  const element = document.getElementById(elementId);
  if (element) element.textContent = count;
}

function initCharts() {
  const ctx = document.getElementById('host-status-chart');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Running', 'Stopped', 'Maintenance'],
      datasets: [{
        data: [75, 15, 10],
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b']
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

// Update the populateHostsTable function
function populateHostsTable(hosts) {
  const tbody = document.getElementById('hosts-table-body');
  if (tbody) {
    tbody.innerHTML = hosts.map(host => `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="p-3">${host.name}</td>
        <td class="p-3">${host.ip}</td>
        <td class="p-3">
          <span class="status-dot ${host.status}"></span>
          ${host.status}
        </td>
        <td class="p-3">${host.cpu}%</td>
        <td class="p-3">${host.memory}GB</td>
        <td class="p-3">${host.storage}GB</td>
      </tr>
    `).join('');
  }
}

function setupEventListeners() {
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) logoutButton.addEventListener('click', logout);

  const addHostBtn = document.getElementById('add-host-btn');
  if (addHostBtn) addHostBtn.addEventListener('click', showHostModal);

  const hostForm = document.getElementById('add-host-form');
  if (hostForm) hostForm.addEventListener('submit', handleHostSubmit);
}

async function handleHostSubmit(e) {
  e.preventDefault();
  const formData = {
    name: document.getElementById('host-name').value,
    ip: document.getElementById('host-ip').value,
    cpu: document.getElementById('host-cpu').value,
    memory: document.getElementById('host-memory').value,
    storage: document.getElementById('host-storage').value,
    location: document.getElementById('host-location').value,
    description: document.getElementById('host-description').value
  };
  
  try {
    await postData('/hosts', formData);
    showToast('Host added successfully', 'success');
    loadDashboardData();
    document.getElementById('add-host-modal').classList.remove('active');
  } catch (error) {
    showToast('Error adding host', 'error');
  }
}

async function fetchData(endpoint) {
  const response = await fetch(`http://localhost:8088/api${endpoint}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
  });
  if (!response.ok) throw new Error('Failed to fetch data');
  return await response.json();
}

async function postData(endpoint, data) {
  const response = await fetch(`http://localhost:8088/api${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to post data');
  return await response.json();
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast-notification');
  if (toast) {
    toast.className = `toast ${type} show`;
    toast.querySelector('.toast-message').textContent = message;
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}

function logout() {
  localStorage.removeItem('authToken');
  window.location.href = 'index.html';
}

function centerHeaderText() {
  const header = document.querySelector('.content-header h1');
  if (header) {
    header.style.textAlign = 'center'; // Ensure the text is centered
  }
}