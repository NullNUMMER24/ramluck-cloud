// dashboard.js
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  checkAuthentication();
  
  // Load dashboard data
  loadDashboardData();
  
  // Load hosts data
  loadHosts();
  
  // Load activities
  loadActivities();
  
  // Initialize host chart
  initializeHostChart();
  
  // Add host modal
  const addHostBtn = document.getElementById('add-host-btn');
  const addHostModal = document.getElementById('add-host-modal');
  const modalClose = document.querySelector('.modal-close');
  const cancelHostBtn = document.getElementById('cancel-host-btn');
  const saveHostBtn = document.getElementById('save-host-btn');
  
  addHostBtn.addEventListener('click', () => {
      addHostModal.style.display = 'flex';
  });
  
  modalClose.addEventListener('click', () => {
      addHostModal.style.display = 'none';
  });
  
  cancelHostBtn.addEventListener('click', () => {
      addHostModal.style.display = 'none';
  });
  
  saveHostBtn.addEventListener('click', async () => {
      const hostName = document.getElementById('host-name').value;
      const hostIp = document.getElementById('host-ip').value;
      const hostCpu = document.getElementById('host-cpu').value;
      const hostMemory = document.getElementById('host-memory').value;
      const hostStorage = document.getElementById('host-storage').value;
      const hostLocation = document.getElementById('host-location').value;
      const hostDescription = document.getElementById('host-description').value;
      
      if (!hostName || !hostIp || !hostCpu || !hostMemory || !hostStorage || !hostLocation) {
          showToast('Validation Error', 'Please fill in all required fields', 'error');
          return;
      }
      
      try {
          const response = await fetch('/api/hosts', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  name: hostName,
                  ipAddress: hostIp,
                  cpuCores: parseInt(hostCpu),
                  memory: parseInt(hostMemory),
                  storage: parseInt(hostStorage),
                  location: hostLocation,
                  description: hostDescription
              }),
              credentials: 'include'
          });
          
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Failed to create host');
          }
          
          showToast('Success', 'Host created successfully', 'success');
          addHostModal.style.display = 'none';
          
          // Reload hosts data
          loadHosts();
          // Reload dashboard data
          loadDashboardData();
          // Reset form
          document.getElementById('add-host-form').reset();
          
      } catch (error) {
          showToast('Error', error.message, 'error');
      }
  });
  
  // Logout handler
  document.getElementById('logout-button').addEventListener('click', async () => {
      try {
          const response = await fetch('/api/logout', {
              method: 'POST',
              credentials: 'include'
          });
          
          if (!response.ok) {
              throw new Error('Logout failed');
          }
          
          // Redirect to login page
          window.location.href = '/auth.html';
          
      } catch (error) {
          showToast('Error', error.message, 'error');
      }
  });
});

async function checkAuthentication() {
  try {
      const response = await fetch('/api/user', {
          credentials: 'include'
      });
      
      if (!response.ok) {
          // If user is not authenticated, redirect to login page
          window.location.href = '/auth.html';
          return;
      }
      
      // Get user data
      const userData = await response.json();
      
      // Update username in header
      document.getElementById('username').textContent = userData.username;
      
  } catch (error) {
      console.error('Authentication check failed:', error);
      window.location.href = '/auth.html';
  }
}

async function loadDashboardData() {
  try {
      const response = await fetch('/api/dashboard/status', {
          credentials: 'include'
      });
      
      if (!response.ok) {
          throw new Error('Failed to load dashboard data');
      }
      
      const dashboardData = await response.json();
      
      // Update stat values
      document.getElementById('hosts-count').textContent = dashboardData.hosts.total;
      document.getElementById('vms-count').textContent = dashboardData.vms.active;
      document.getElementById('users-count').textContent = dashboardData.users.total;
      document.getElementById('apps-count').textContent = dashboardData.applications.total;
      
      // Load host status for chart
      const hostStatusResponse = await fetch('/api/dashboard/host-status', {
          credentials: 'include'
      });
      
      if (!hostStatusResponse.ok) {
          throw new Error('Failed to load host status data');
      }
      
      const hostStatusData = await hostStatusResponse.json();
      
      // Update chart
      updateHostChart(hostStatusData);
      
  } catch (error) {
      showToast('Error', error.message, 'error');
  }
}

async function loadHosts() {
  try {
      const response = await fetch('/api/hosts', {
          credentials: 'include'
      });
      
      if (!response.ok) {
          throw new Error('Failed to load hosts');
      }
      
      const hosts = await response.json();
      
      const hostsTableBody = document.getElementById('hosts-table-body');
      hostsTableBody.innerHTML = '';
      
      hosts.forEach(host => {
          const row = document.createElement('tr');
          
          row.innerHTML = `
              <td>
                  <div class="host-name">${host.name}</div>
              </td>
              <td>${host.ipAddress}</td>
              <td>
                  <span class="status-badge status-${host.status.toLowerCase()}">${host.status}</span>
              </td>
              <td>
                  <div class="progress-bar">
                      <div class="progress" style="width: ${host.cpuUsage}%"></div>
                  </div>
                  <div class="progress-text">${host.cpuUsage}%</div>
              </td>
              <td>
                  <div class="progress-bar">
                      <div class="progress" style="width: ${(host.memoryUsed / host.memoryTotal) * 100}%"></div>
                  </div>
                  <div class="progress-text">${host.memoryUsed} / ${host.memoryTotal} GB</div>
              </td>
              <td>
                  <div class="progress-bar">
                      <div class="progress" style="width: ${(host.storageUsed / host.storageTotal) * 100}%"></div>
                  </div>
                  <div class="progress-text">${host.storageUsed} / ${host.storageTotal} GB</div>
              </td>
          `;
          
          hostsTableBody.appendChild(row);
      });
      
  } catch (error) {
      showToast('Error', error.message, 'error');
  }
}

async function loadActivities() {
  try {
      const response = await fetch('/api/dashboard/activities', {
          credentials: 'include'
      });
      
      if (!response.ok) {
          throw new Error('Failed to load activities');
      }
      
      const activities = await response.json();
      
      const activityList = document.getElementById('activity-list');
      activityList.innerHTML = '';
      
      activities.forEach(activity => {
          const li = document.createElement('li');
          li.classList.add('activity-item');
          
          // Format the timestamp
          const date = new Date(activity.timestamp);
          const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
          
          // Determine icon based on activity type
          let icon = '';
          switch (activity.type) {
              case 'user':
                  icon = '👤';
                  break;
              case 'vm':
                  icon = '💻';
                  break;
              case 'warning':
                  icon = '⚠️';
                  break;
              case 'app':
                  icon = '📱';
                  break;
              default:
                  icon = '🔔';
          }
          
          li.innerHTML = `
              <div class="activity-icon ${activity.type}-icon">${icon}</div>
              <div class="activity-content">
                  <div class="activity-message">${activity.message}</div>
                  <div class="activity-time">${formattedDate}</div>
              </div>
          `;
          
          activityList.appendChild(li);
      });
      
  } catch (error) {
      showToast('Error', error.message, 'error');
  }
}

function initializeHostChart() {
  const ctx = document.getElementById('host-status-chart').getContext('2d');
  
  window.hostStatusChart = new Chart(ctx, {
      type: 'pie',
      data: {
          labels: ['Healthy', 'Warning', 'Critical', 'Offline'],
          datasets: [{
              data: [0, 0, 0, 0],
              backgroundColor: [
                  '#10b981', // Green for healthy
                  '#f59e0b', // Amber for warning
                  '#ef4444', // Red for critical
                  '#6b7280'  // Gray for offline
              ]
          }]
      },
      options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
              legend: {
                  position: 'right'
              }
          }
      }
  });
}

function updateHostChart(hostStatusData) {
  window.hostStatusChart.data.datasets[0].data = [
      hostStatusData.healthy,
      hostStatusData.warning,
      hostStatusData.critical,
      hostStatusData.offline
  ];
  
  window.hostStatusChart.update();
}

function showToast(title, message, type = 'info') {
  const toast = document.getElementById('toast-notification');
  const toastTitle = toast.querySelector('.toast-title');
  const toastMessage = toast.querySelector('.toast-message');
  
  toast.className = 'toast';
  toast.classList.add(`toast-${type}`);
  
  toastTitle.textContent = title;
  toastMessage.textContent = message;
  
  toast.classList.add('visible');
  
  setTimeout(() => {
      toast.classList.remove('visible');
  }, 3000);
}