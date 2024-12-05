// Handles the login form
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    try {
        const response = await fetch('http://localhost:8080/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login: username, password }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error ${response.status}:`, errorText);
            alert('Login failed. Please check your credentials.');
            return;
        }

        const data = await response.json();
        const token = data.token;
        const role = data.role;
        const employeeId = data.employeeId;

        // Store the token in sessionStorage
        sessionStorage.setItem('jwtToken', token);
        sessionStorage.setItem('userRole', role);
        sessionStorage.setItem('employeeId', employeeId);

        alert('Login successful! Redirecting to the main page...');
        if (role === 'USER') {
            // Redirect the user directly to the employee details page
            window.location.href = `employee-details.html?id=${employeeId}`;
        } else if (role === 'ADMIN') {
            // Redirect the admin to the employee list page
            window.location.href = 'employees.html';
        } // Redirect to the main page
    } catch (error) {
        console.error('Request error:', error);
        alert('Error connecting to the server.');
    }
});

// Handles the registration form
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value.trim();
    const role = document.getElementById('register-role').value;

    try {
        const response = await fetch('http://localhost:8080/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login: username, password, role }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error ${response.status}:`, errorText);
            alert('Registration failed. Please try again.');
            return;
        }

        alert('User registered successfully! You can now log in.');
        document.getElementById('show-login').click(); // Switch to the login form
    } catch (error) {
        console.error('Request error:', error);
        alert('Error connecting to the server.');
    }
});

// Switch between login and registration forms
document.getElementById('show-register').addEventListener('click', () => {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
});

document.getElementById('show-login').addEventListener('click', () => {
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
});
