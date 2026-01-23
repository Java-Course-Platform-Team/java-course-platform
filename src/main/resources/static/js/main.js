// main.js - Versão Corrigida para Nuvem
//  CONFIGURAÇÃO AUTOMÁTICA DE AMBIENTE
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8081"                  // Se estou no PC, uso IntelliJ Local
    : "https://odonto-backend-j9oy.onrender.com"; // Se estou na Web, uso a Nuvem

async function loadNavbar() {
    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) return;

    try {
        const response = await fetch('/components/navbar.html');
        if (response.ok) {
            navbarContainer.innerHTML = await response.text();
            setupLogout();
            updateUserInfo();
        }
    } catch (error) {
        console.warn('Navbar carregada localmente.');
    }
}

function setupLogout() {
    document.getElementById('btn-logout')?.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/auth/login.html';
    });
}

function updateUserInfo() {
    const nameEl = document.getElementById('user-name-display');
    const storedUser = localStorage.getItem('user');
    if (nameEl && storedUser) {
        const user = JSON.parse(storedUser);
        nameEl.textContent = user.name || 'Usuário';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadNavbar();
});