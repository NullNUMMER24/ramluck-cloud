// auth.js
document.addEventListener('DOMContentLoaded', function() {
  // Tab switching
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
      button.addEventListener('click', () => {
          // Remove active class from all buttons and hide all content
          tabButtons.forEach(btn => btn.classList.remove('active'));
          tabContents.forEach(content => content.classList.add('hidden'));
          
          // Add active class to clicked button and show corresponding content
          button.classList.add('active');
          const tabName = button.getAttribute('data-tab');
          document.getElementById(`${tabName}-tab`).classList.remove('hidden');
      });
  });
  
  // Handle login form submission
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;
      
      try {
          const response = await fetch('/api/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ username, password }),
              credentials: 'include'
          });
          
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Login failed');
          }
          
          const userData = await response.json();
          
          // Show success notification
          showToast('Login successful', 'Welcome to RAMLUCK-CLOUD', 'success');
          
          // Redirect to dashboard
          setTimeout(() => {
              window.location.href = '/dashboard.html';
          }, 1000);
          
      } catch (error) {
          showToast('Login failed', error.message, 'error');
      }
  });
  
  // Handle register form submission
  const registerForm = document.getElementById('register-form');
  registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('register-username').value;
      const password = document.getElementById('register-password').value;
      
      try {
          const response = await fetch('/api/register', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ username, password }),
              credentials: 'include'
          });
          
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Registration failed');
          }
          
          const userData = await response.json();
          
          // Show success notification
          showToast('Registration successful', 'Welcome to RAMLUCK-CLOUD', 'success');
          
          // Redirect to dashboard
          setTimeout(() => {
              window.location.href = '/dashboard.html';
          }, 1000);
          
      } catch (error) {
          showToast('Registration failed', error.message, 'error');
      }
  });
  
  // Toast notification function
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
});