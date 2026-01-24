// auth.js - Gerenciamento de Autenticação com Validação Completa

const API_BASE_URL = window.location.hostname === "localhost"
    ? "http://localhost:8081"
    : "https://odonto-backend-j9oy.onrender.com";

// Função utilitária para exibir erros (Requer Toastify)
function showError(message) {
    if (typeof Toastify === 'function') {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "#ef4444" } // Vermelho
        }).showToast();
    } else {
        alert(message);
    }
}

function showSuccess(message) {
    if (typeof Toastify === 'function') {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "#D4AF37" } // Dourado
        }).showToast();
    }
}

// Lógica de Login
async function handleLogin(event) {
    event.preventDefault();

    const loginInput = document.getElementById('email'); // O ID permanece o mesmo do HTML, mas agora tratamos como login (email ou cpf)
    const passwordInput = document.getElementById('password');
    const submitBtn = event.target.querySelector('button[type="submit"]');

    const login = loginInput.value.trim();
    const password = passwordInput.value.trim();

    // VALIDAÇÃO FRONTEND
    if (!login) {
        showError("Por favor, digite seu e-mail ou CPF.");
        loginInput.focus();
        return;
    }
    if (!password) {
        showError("Por favor, digite sua senha.");
        passwordInput.focus();
        return;
    }

    // Feedback visual
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = "Autenticando...";
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Alterado de { email, password } para { email: login, password }
            // para que o backend receba o valor no campo esperado, seja ele e-mail ou CPF
            body: JSON.stringify({ email: login, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            showSuccess("Login realizado com sucesso!");

            setTimeout(() => {
                if (data.user.role === 'ADMIN') {
                    window.location.href = '/admin/dashboard.html';
                } else {
                    window.location.href = '/aluno/area-aluno.html';
                }
            }, 1000);
        } else {
            const errorData = await response.json().catch(() => ({}));
            showError(errorData.message || "Credenciais inválidas.");
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Erro:', error);
        showError("Erro ao conectar com o servidor.");
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
    }
}

// Lógica de Cadastro
async function handleRegister(event) {
    event.preventDefault();

    const nameInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const cpfInput = document.getElementById('cpf'); // NOVO: Captura o campo CPF
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const submitBtn = event.target.querySelector('button[type="submit"]');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const cpf = cpfInput ? cpfInput.value.trim() : ""; // NOVO: Valor do CPF
    const password = passwordInput.value.trim();

    // VALIDAÇÃO FRONTEND ROBUSTA
    if (name.length < 3) {
        showError("O nome deve ter pelo menos 3 caracteres.");
        nameInput.focus();
        return;
    }
    if (!email.includes('@') || !email.includes('.')) {
        showError("Por favor, insira um e-mail válido.");
        emailInput.focus();
        return;
    }
    // Validação básica de CPF
    if (cpf.length < 11) {
        showError("Por favor, insira um CPF válido.");
        if(cpfInput) cpfInput.focus();
        return;
    }
    if (password.length < 6) {
        showError("A senha deve ter no mínimo 6 caracteres.");
        passwordInput.focus();
        return;
    }

    if (confirmPasswordInput) {
        if (password !== confirmPasswordInput.value.trim()) {
            showError("As senhas não coincidem.");
            confirmPasswordInput.focus();
            return;
        }
    }

    submitBtn.innerText = "Criando conta...";
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // NOVO: Adicionado 'cpf' ao corpo da requisição
            body: JSON.stringify({ name, email, cpf, password, role: 'STUDENT' })
        });

        if (response.ok) {
            showSuccess("Conta criada! Redirecionando para login...");
            setTimeout(() => {
                window.location.href = '/auth/login.html';
            }, 1500);
        } else {
            const errorText = await response.text();
            try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.errors) {
                    const firstError = Object.values(errorJson.errors)[0];
                    showError(firstError || "Dados inválidos.");
                } else {
                    showError(errorJson.message || "Erro ao criar conta.");
                }
            } catch (e) {
                showError("Erro ao criar conta. E-mail ou CPF já podem estar em uso.");
            }
            submitBtn.innerText = "Criar Conta";
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Erro:', error);
        showError("Erro de conexão.");
        submitBtn.innerText = "Criar Conta";
        submitBtn.disabled = false;
    }
}

// Inicialização dos Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});