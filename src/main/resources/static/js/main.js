// main.js - Versão Final (Logout, Navbar e Config Inteligente)

// 1. CONFIGURAÇÃO AUTOMÁTICA DE AMBIENTE 🧠
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8081"                  // Local (IntelliJ)
    : "https://odonto-backend-j9oy.onrender.com"; // Nuvem (Render)

// 2. CARREGAR NAVBAR DINAMICAMENTE 🧩
async function loadNavbar() {
    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) return;

    try {
        const response = await fetch('/components/navbar.html');
        if (response.ok) {
            navbarContainer.innerHTML = await response.text();

            // IMPORTANTE: Só configura o Logout e o Nome DEPOIS que a navbar apareceu
            updateUserInfo();
            setupLogout();
        }
    } catch (error) {
        console.warn('Erro ao carregar navbar:', error);
    }
}

// 3. CONFIGURAR O BOTÃO DE SAIR (LOGOUT) 🚪
function setupLogout() {
    const logoutBtn = document.getElementById('btn-logout');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Evita comportamento padrão de link

            // Pergunta elegante antes de sair
            if (confirm("Tem certeza que deseja sair?")) {
                // Limpa tudo
                localStorage.clear();
                // Redireciona
                window.location.href = '/auth/login.html';
            }
        });
    }
}

// 4. ATUALIZAR NOME DO USUÁRIO NA TELA 👤
function updateUserInfo() {
    const nameEl = document.getElementById('user-name-display');
    const storedUser = localStorage.getItem('user');

    if (nameEl && storedUser) {
        try {
            const user = JSON.parse(storedUser);
            // Pega o primeiro nome para não ficar gigante na barra
            const firstName = user.name ? user.name.split(' ')[0] : 'Usuário';
            nameEl.textContent = `Olá, Dr(a). ${firstName}`;
        } catch (e) {
            nameEl.textContent = 'Bem-vindo';
        }
    }
}

// 5. INICIALIZAÇÃO 🚀
document.addEventListener('DOMContentLoaded', () => {
    loadNavbar();
});