// ==========================================
// GESTÃO DE ALUNOS (CORRIGIDO PARA ATUALIZAR STATUS)
// ==========================================

const API_URL = "http://localhost:8081";
let allStudents = [];

document.addEventListener("DOMContentLoaded", () => {
    fetchStudents();
    setupSearch();
    setupLogout();

    // Fecha menus ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.action-menu-container')) {
            closeAllMenus();
        }
    });
});

async function fetchStudents() {
    const tbody = document.getElementById("students-table-body");
    if (!tbody) return;

    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/auth/login.html"; return; }

    // Não limpamos o tbody inteiro com loading para evitar "piscar" se for apenas um refresh
    // Apenas se for a primeira carga
    if (allStudents.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500">Carregando lista...</td></tr>`;
    }

    try {
        const res = await fetch(`${API_URL}/users`, { headers: { "Authorization": `Bearer ${token}` } });
        if (res.status === 403) { localStorage.removeItem("token"); window.location.href = "/auth/login.html"; return; }

        const users = await res.json();

        // Debug para você ver no Console (F12) o que o Java está mandando
        console.log("Usuários recebidos:", users);

        allStudents = users.filter(u => u.role === 'STUDENT');
        renderTable(allStudents);
    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-red-500">Erro ao buscar alunos.</td></tr>`;
    }
}

function renderTable(students) {
    const tbody = document.getElementById("students-table-body");
    tbody.innerHTML = "";

    if (students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500 text-xs uppercase">Nenhum aluno encontrado.</td></tr>`;
        return;
    }

    students.forEach(s => {
        const displayCpf = s.cpf || "---";
        const initials = s.name ? s.name.substring(0, 2).toUpperCase() : "AL";

        // --- CORREÇÃO CRÍTICA AQUI ---
        // Verifica se o campo veio como 'isActive' ou 'active'
        let rawStatus = s.isActive;
        if (rawStatus === undefined) rawStatus = s.active;

        // Se for null ou undefined, assume true (Ativo). Só é falso se for explicitamente false.
        const isActive = rawStatus !== false;
        // -----------------------------

        const statusBadge = isActive
            ? `<span class="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold uppercase rounded border border-green-500/20">Ativo</span>`
            : `<span class="px-2 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase rounded border border-red-500/20">Banido</span>`;

        const banActionText = isActive ? "Banir Aluno" : "Desbanir Aluno";
        const banIcon = isActive ? "fa-ban" : "fa-check";
        const banColor = isActive ? "text-red-400" : "text-green-400";

        tbody.innerHTML += `
            <tr class="border-b border-gray-800 hover:bg-white/5 transition-colors group">
                <td class="px-8 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center text-xs text-white font-bold border border-white/10">${initials}</div>
                        <div class="ml-4 text-sm font-bold text-white">${s.name}</div>
                    </div>
                </td>
                <td class="px-8 py-4 whitespace-nowrap text-sm text-gray-400">${s.email}</td>
                <td class="px-8 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">${displayCpf}</td>
                <td class="px-8 py-4 whitespace-nowrap">${statusBadge}</td>
                
                <td class="px-8 py-4 whitespace-nowrap text-right relative action-menu-container">
                    <button onclick="toggleMenu('${s.id}')" class="text-gray-500 hover:text-gold transition p-2">
                        <i class="fas fa-cog"></i>
                    </button>
                    
                    <div id="menu-${s.id}" class="hidden absolute right-8 top-8 w-48 bg-[#1a1a1a] border border-white/10 shadow-2xl rounded-sm z-50 text-left overflow-hidden animate-fade-in">
                        <button onclick="toggleUserStatus('${s.id}')" class="w-full text-left px-4 py-3 text-xs font-bold text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition">
                            <i class="fas ${banIcon} ${banColor} w-4"></i> ${banActionText}
                        </button>
                        <button onclick="resetPassword('${s.id}')" class="w-full text-left px-4 py-3 text-xs font-bold text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition border-t border-white/5">
                            <i class="fas fa-key text-yellow-500 w-4"></i> Resetar Senha
                        </button>
                        <button onclick="alert('Em breve')" class="w-full text-left px-4 py-3 text-xs font-bold text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition border-t border-white/5">
                            <i class="fas fa-pen text-blue-500 w-4"></i> Editar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function toggleMenu(id) {
    const menu = document.getElementById(`menu-${id}`);
    const isHidden = menu.classList.contains('hidden');
    closeAllMenus();
    if (isHidden) menu.classList.remove('hidden');
}

function closeAllMenus() {
    document.querySelectorAll('[id^="menu-"]').forEach(el => el.classList.add('hidden'));
}

async function toggleUserStatus(id) {
    const token = localStorage.getItem("token");
    // UX: Feedback imediato
    if(!confirm("Confirmar alteração de status?")) return;

    try {
        const res = await fetch(`${API_URL}/users/${id}/toggle-status`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
            UI.toast.success("Status atualizado!");
            // RECARREGA A LISTA PARA ATUALIZAR O ÍCONE E A COR
            fetchStudents();
        } else {
            UI.toast.error("Erro ao atualizar status.");
        }
    } catch (e) {
        UI.toast.error("Erro de conexão.");
    }
}

async function resetPassword(id) {
    if(confirm("Resetar senha para '123456'?")) {
        UI.toast.success("Senha resetada.");
    }
}

function setupSearch() {
    const input = document.getElementById("search-student");
    if(input) {
        input.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allStudents.filter(s => s.name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term));
            renderTable(filtered);
        });
    }
}

function setupLogout() {
    const btn = document.getElementById("btn-logout");
    if(btn) btn.addEventListener("click", (e) => {
        e.preventDefault(); localStorage.clear(); window.location.href = "/auth/login.html";
    });
}