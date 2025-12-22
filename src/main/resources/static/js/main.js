const API_BASE_URL = 'http://localhost:8080'; // Ajuste se necessário

// 1. Função para carregar a Navbar
async function loadNavbar() {
    const navbarContainer = document.getElementById('navbar-container');

    if (navbarContainer) {
        try {
            // Busca o HTML da navbar
            const response = await fetch('/components/navbar.html');
            if (response.ok) {
                const html = await response.text();
                navbarContainer.innerHTML = html;

                // Após injetar o HTML, configura o evento de Logout
                setupLogout();
                // Opcional: Atualizar nome do usuário na navbar se tiver salvo no localStorage
                updateUserInfo();
            } else {
                console.error('Erro ao carregar navbar');
            }
        } catch (error) {
            console.error('Erro na requisição da navbar:', error);
        }
    }
}

// 2. Configura o Logout
function setupLogout() {
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user'); // Se você estiver salvando dados do user
            window.location.href = '/auth/login.html';
        });
    }
}

// 3. Atualiza info do usuário (Visual)
function updateUserInfo() {
    const userNameElement = document.getElementById('user-name-display');
    const storedUser = localStorage.getItem('user'); // Supondo que salvamos um JSON do user no login

    if (userNameElement && storedUser) {
        const user = JSON.parse(storedUser);
        userNameElement.textContent = user.name || 'Usuário';
    }
}

// 4. Verificação de Segurança (Auto-executável)
(function checkAuth() {
    const token = localStorage.getItem('token');
    // Lista de páginas públicas que não precisam de token
    const publicPages = ['/index.html', '/auth/login.html', '/auth/cadastro.html', '/'];

    const path = window.location.pathname;

    // Se não tiver token e não estiver numa página pública -> Login
    if (!token && !publicPages.includes(path)) {
        window.location.href = '/auth/login.html';
    }
})();

// Inicializa componentes globais
document.addEventListener('DOMContentLoaded', () => {
    loadNavbar();
});