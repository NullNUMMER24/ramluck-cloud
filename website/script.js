document.getElementById('to-register').addEventListener('click', function() {
  document.getElementById('card').style.transform = 'rotateY(180deg)';
});

document.getElementById('to-login').addEventListener('click', function() {
  document.getElementById('card').style.transform = 'rotateY(0deg)';
});

document.getElementById('login-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  loginUser(email, password);
});

document.getElementById('register-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  registerUser(username, email, password);
});

async function loginUser(email, password) {
  try {
    const response = await fetch('http://localhost:8088/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    console.log('Login successful:', data);
    // Redirect or handle successful login
  } catch (error) {
    console.error('Error:', error);
    // Display error message to user
  }
}

async function registerUser(username, email, password) {
  try {
    const response = await fetch('http://localhost:8088/api/login/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const data = await response.json();
    console.log('Registration successful:', data);
    // Redirect or handle successful registration
  } catch (error) {
    console.error('Error:', error);
    // Display error message to user
  }
}
