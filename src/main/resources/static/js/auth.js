// auth.js - Conexão com Backend Blindado

// URL dinâmica (Local vs Produção)
const API_BASE_URL = window.location.hostname === "localhost"
    ? "http://localhost:8081"
    : "https://odonto-backend-j9oy.onrender.com";

// --- UTILITÁRIOS ---

function showError(message) {
    if (typeof Toastify === 'function') {
        Toastify({
            text: message,
            duration: 4000,
            gravity: "top",
            position: "right",
            style: { background: "#991b1b" } // Vermelho escuro elegante
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
            style: { background: "#D4AF37", color: "#000" } // Dourado com texto preto
        }).showToast();
    }
}

// Remove tudo que não for número (para enviar CPF limpo)
function cleanDigits(value) {
    return value.replace(/\D/g, '');
}

// --- LÓGICA DE LOGIN ---
async function handleLogin(event) {
    event.preventDefault();

    const loginInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = event.target.querySelector('button[type="submit"]');

    const loginValue = loginInput.value.trim();
    const password = passwordInput.value.trim();

    // 1. Validação Visual
    if (!loginValue) return showError("Por favor, digite seu e-mail.");
    if (!password) return showError("Por favor, digite sua senha.");

    // 2. Feedback de Carregamento
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Acessando...";
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-70', 'cursor-not-allowed');

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // O Backend espera { "email": "...", "password": "..." }
            // Nota: Mesmo se for CPF, enviamos no campo 'email' pois o DTO backend pede assim.
            body: JSON.stringify({
                email: loginValue,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // SUCESSO!
            // data = { token: "...", user: { id: "...", name: "...", role: "..." } }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user)); // Salva o objeto usuário sem senha

            showSuccess(`Bem-vindo, Dr(a). ${data.user.name.split(' ')[0]}!`);

            // Redirecionamento Inteligente baseado na Role
            setTimeout(() => {
                if (data.user.role === 'ADMIN') {
                    window.location.href = '/admin/dashboard.html';
                } else {
                    window.location.href = '/aluno/area-aluno.html';
                }
            }, 1500);

        } else {
            // ERRO (401, 403, 404)
            // Tenta pegar a mensagem específica do backend ou usa uma genérica
            const msg = data.message || "E-mail ou senha incorretos.";
            showError(msg);
            resetButton(submitBtn, originalText);
        }

    } catch (error) {
        console.error('Erro de Login:', error);
        showError("Servidor indisponível. Tente novamente mais tarde.");
        resetButton(submitBtn, originalText);
    }
}

// --- LÓGICA DE CADASTRO ---
async function handleRegister(event) {
    event.preventDefault();

    const nameInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const cpfInput = document.getElementById('cpf');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const submitBtn = event.target.querySelector('button[type="submit"]');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const rawCpf = cpfInput.value.trim();
    const password = passwordInput.value.trim();

    // 1. Validações Frontend
    if (name.length < 3) return showError("Digite seu nome completo.");
    if (!validateEmail(email)) return showError("E-mail inválido.");

    // Limpa o CPF para contar apenas números
    const cleanCpf = cleanDigits(rawCpf);
    if (cleanCpf.length !== 11) return showError("O CPF deve conter 11 dígitos.");

    if (password.length < 6) return showError("A senha deve ter no mínimo 6 caracteres.");
    if (password !== confirmPasswordInput.value.trim()) return showError("As senhas não conferem.");

    // 2. Feedback
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Registrando...";
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // ENVIA APENAS O QUE O USERCREATEDTO ESPERA
            // Removemos 'role' pois o backend força STUDENT
            body: JSON.stringify({
                name: name,
                email: email,
                cpf: cleanCpf, // Envia apenas números
                password: password
            })
        });

        if (response.ok) {
            showSuccess("Cadastro realizado com sucesso!");
            setTimeout(() => {
                window.location.href = '/auth/login.html';
            }, 2000);
        } else {
            // Tratamento de erros de validação do Spring Boot (Ex: CPF duplicado)
            const errorText = await response.text();
            let errorMessage = "Erro ao criar conta.";

            try {
                const errorJson = JSON.parse(errorText);
                // Se for erro de validação (ex: @NotBlank), o Spring manda um array de erros
                if (errorJson.errors) {
                     // Pega o primeiro erro da lista
                    errorMessage = Object.values(errorJson.errors)[0];
                } else if (errorJson.message) {
                    errorMessage = errorJson.message; // Ex: "E-mail já cadastrado"
                }
            } catch (e) { /* JSON inválido, usa msg padrão */ }

            showError(errorMessage);
            resetButton(submitBtn, originalText);
        }

    } catch (error) {
        console.error('Erro de Cadastro:', error);
        showError("Erro de conexão com o servidor.");
        resetButton(submitBtn, originalText);
    }
}

// --- AUXILIARES ---
function resetButton(btn, originalText) {
    btn.innerText = originalText;
    btn.disabled = false;
    btn.classList.remove('opacity-70', 'cursor-not-allowed');
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    // Máscara simples de CPF no input (Visual apenas)
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, "");
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            e.target.value = value;
        });
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const registerForm = document.getElementById('register-form');
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
});