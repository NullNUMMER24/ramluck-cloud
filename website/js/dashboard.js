document.addEventListener('DOMContentLoaded', function() {
  // Initialize Host Status Pie Chart
  const ctx = document.getElementById('host-status-chart').getContext('2d');
  new Chart(ctx, {
      type: 'pie',
      data: {
          labels: ['Online', 'Offline', 'Maintenance'],
          datasets: [{
              data: [85, 10, 5],
              backgroundColor: ['#4CAF50', '#f44336', '#FFC107'],
              borderWidth: 0
          }]
      },
      options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
              legend: {
                  position: 'bottom'
              }
          }
      }
  });

  // Modal Handling
  const addHostModal = document.getElementById('add-host-modal');
  const addHostBtn = document.getElementById('add-host-btn');
  const closeModalBtns = document.querySelectorAll('.modal-close, #cancel-host-btn');

  addHostBtn.addEventListener('click', () => {
      addHostModal.classList.add('active');
  });

  closeModalBtns.forEach(btn => {
      btn.addEventListener('click', () => {
          addHostModal.classList.remove('active');
      });
  });

  // Toast Notification
  function showToast(title, message, type = 'info') {
      const toast = document.getElementById('toast-notification');
      toast.querySelector('.toast-title').textContent = title;
      toast.querySelector('.toast-message').textContent = message;
      toast.classList.add('show', type);
      
      setTimeout(() => {
          toast.classList.remove('show', type);
      }, 3000);
  }

  // Form Submission
  document.getElementById('save-host-btn').addEventListener('click', function(e) {
      e.preventDefault();
      // Add host logic here
      showToast('Success', 'New host added successfully', 'success');
      addHostModal.classList.remove('active');
  });

  // Sample Data Loading
  document.getElementById('hosts-count').textContent = '24';
  document.getElementById('vms-count').textContent = '156';
  document.getElementById('users-count').textContent = '89';
  document.getElementById('apps-count').textContent = '45';
});