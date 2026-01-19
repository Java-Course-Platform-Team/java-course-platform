// main.js - Versão Corrigida para Porta 8081
const API_BASE_URL = 'http://localhost:8081';

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