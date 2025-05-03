document.addEventListener('DOMContentLoaded', async () => {
  await loadUsers();
});

async function loadUsers() {
  try {
      const response = await fetch(`${API_BASE}/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to load users');
      
      const users = await response.json();
      renderUsers(users);
  } catch (error) {
      showErrorAlert(error.message);
  }
}

function renderUsers(users) {
  const tbody = document.getElementById('users-table');
  tbody.innerHTML = users.map(user => `
      <tr>
          <td>${user.Username}</td>
          <td>${user.Email}</td>
          <td><span class="badge ${user.Role === 'admin' ? 'badge-primary' : 'badge-secondary'}">${user.Role}</span></td>
          <td>${new Date(user.CreatedAt).toLocaleDateString()}</td>
          <td>
              <button class="btn btn-sm btn-ghost" onclick="editUser('${user.UserID}')">
                  <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-ghost text-error" onclick="deleteUser('${user.UserID}')">
                  <i class="fas fa-trash"></i>
              </button>
          </td>
      </tr>
  `).join('');
}

// Add similar files for other sections (vms.js, groups.js, etc.)