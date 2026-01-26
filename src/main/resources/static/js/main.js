// main.js - Configurações Globais e Navbar
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8081"
    : "https://odonto-backend-j9oy.onrender.com";

document.addEventListener('DOMContentLoaded', () => {
    loadNavbar();
});

// 1. CARREGAR NAVBAR DINAMICAMENTE
async function loadNavbar() {
    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) return;

    try {
        const response = await fetch('/components/navbar.html');
        if (response.ok) {
            navbarContainer.innerHTML = await response.text();
            // Configurações que dependem da navbar estar na tela:
            updateUserInfo();
            setupLogout();
        }
    } catch (error) {
        console.warn('Erro ao carregar navbar (verifique se o arquivo existe).');
    }
}

// 2. CONFIGURAR LOGOUT
function setupLogout() {
    // Usa "event delegation" para garantir que funcione mesmo carregado via AJAX
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('#btn-logout')) {
            e.preventDefault();
            if (confirm("Tem certeza que deseja sair?")) {
                localStorage.clear();
                window.location.href = '/auth/login.html';
            }
        }
    });
}

// 3. ATUALIZAR NOME NA NAVBAR
function updateUserInfo() {
    const nameEl = document.getElementById('user-name-display');
    const storedUser = localStorage.getItem('user');

    if (nameEl && storedUser) {
        try {
            const user = JSON.parse(storedUser);
            const firstName = user.name ? user.name.split(' ')[0] : 'Doutor(a)';
            nameEl.textContent = `Olá, Dr(a). ${firstName}`;
        } catch (e) {
            nameEl.textContent = 'Bem-vindo';
        }
    }
}