// Gerencia o formulário de login
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
            console.error(`Erro ${response.status}:`, errorText);
            alert('Erro ao fazer login. Verifique as credenciais.');
            return;
        }

        const data = await response.json();
        const token = data.token;

        // Armazena o token no sessionStorage
        sessionStorage.setItem('jwtToken', token);

        alert('Login bem-sucedido! Redirecionando para a página principal...');
        window.location.href = 'employees.html'; // Redireciona para a página principal
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro ao conectar com o servidor.');
    }
});

// Gerencia o formulário de registro
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
            console.error(`Erro ${response.status}:`, errorText);
            alert('Erro ao registrar. Por favor, tente novamente.');
            return;
        }

        alert('Usuário registrado com sucesso! Agora você pode fazer login.');
        document.getElementById('show-login').click(); // Alterna para o formulário de login
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro ao conectar com o servidor.');
    }
});

// Alterna entre os formulários de login e registro
document.getElementById('show-register').addEventListener('click', () => {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
});

document.getElementById('show-login').addEventListener('click', () => {
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
});
