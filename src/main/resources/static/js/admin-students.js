// admin-students.js - GESTÃO DE ALUNOS (VERSÃO CORRIGIDA)
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8081"
    : "https://odonto-backend-j9oy.onrender.com";

const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {
    // Se não tiver token, chuta pro login
    if (!token) { window.location.href = "/auth/login.html"; return; }
    fetchStudents();
});

async function fetchStudents() {
    try {
        const res = await fetch(`${API_URL}/users`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        // Se o token venceu (401/403), desloga
        if (res.status === 401 || res.status === 403) {
            localStorage.clear();
            window.location.href = "/auth/login.html";
            return;
        }

        const students = await res.json();
        renderTable(students);
    } catch (e) {
        showToast("Erro ao carregar lista de alunos.", "error");
    }
}

function renderTable(list) {
    const tbody = document.getElementById("students-table-body");
    if (!tbody) return;

    // Limpa o spinner de carregamento antes de renderizar
    tbody.innerHTML = "";

    if (!list || list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="px-8 py-10 text-center text-gray-500 italic">Nenhum aluno encontrado.</td></tr>`;
        return;
    }
    // ... restante do seu mapeamento (map) ...
}

    tbody.innerHTML = list.map(s => {
        // --- CORREÇÃO DO STATUS ---
        // Verifica se o campo se chama 'active', 'isActive' ou 'enabled'
        // Se o Java mandar qualquer um desses, o JS vai entender.
        let statusReal = true; // Assume true por padrão para evitar falso-banimento visual

        if (s.active !== undefined) statusReal = s.active;
        else if (s.isActive !== undefined) statusReal = s.isActive;
        else if (s.enabled !== undefined) statusReal = s.enabled;

        return `
        <tr class="hover:bg-white/5 transition border-b border-white/5">
            <td class="px-8 py-4 text-white font-bold">${s.name}</td>
            <td class="px-8 py-4 text-sm text-gray-400">${s.email}</td>
            <td class="px-8 py-4 text-sm text-gray-500">${s.cpf || '---'}</td>
            <td class="px-8 py-4">
                <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusReal ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}">
                    ${statusReal ? 'Ativo' : 'Banido'}
                </span>
            </td>
            <td class="px-8 py-4 text-right space-x-2">
                <button onclick="editStudent('${s.id}', '${s.name}', '${s.email}', '${s.cpf || ''}')" class="text-gray-400 hover:text-blue-400 transition" title="Editar"><i class="fas fa-edit"></i></button>
                <button onclick="toggleStatus('${s.id}')" class="text-gray-400 hover:text-gold transition" title="Banir/Ativar"><i class="fas fa-ban"></i></button>
                <button onclick="resetPassword('${s.id}')" class="text-gray-400 hover:text-green-400 transition" title="Resetar Senha"><i class="fas fa-key"></i></button>
                <button onclick="deleteUser('${s.id}')" class="text-gray-400 hover:text-red-500 transition" title="Excluir"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `}).join("");
}

async function toggleStatus(id) {
    try {
        const res = await fetch(`${API_URL}/users/${id}/toggle-status`, {
            method: 'PATCH',
            headers: { "Authorization": `Bearer ${token}` }
        });
        if(res.ok) {
            showToast("Status do aluno alterado.");
            fetchStudents(); // Recarrega a tabela
        } else {
            showToast("Erro ao alterar status.", "error");
        }
    } catch(e) { showToast("Erro de conexão.", "error"); }
}

async function resetPassword(id) {
    if(confirm("Deseja resetar a senha deste aluno para 'odonto123'?")) {
        try {
            const res = await fetch(`${API_URL}/users/${id}/reset-password`, {
                method: 'PATCH',
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                showToast("Senha resetada para 'odonto123'.");
            } else {
                showToast("Erro ao resetar senha.", "error");
            }
        } catch(e) { showToast("Erro de conexão.", "error"); }
    }
}

async function deleteUser(id) {
    if(confirm("AVISO CRÍTICO: Esta ação excluirá permanentemente o aluno. Continuar?")) {
        try {
            const res = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE',
                headers: { "Authorization": `Bearer ${token}` }
            });
            if(res.ok) {
                showToast("Usuário removido do banco.");
                fetchStudents();
            } else {
                showToast("Erro ao excluir usuário.", "error");
            }
        } catch(e) { showToast("Erro de conexão.", "error"); }
    }
}

async function editStudent(id, name, email, cpf) {
    const newName = prompt("Novo Nome:", name);
    if(newName === null) return;

    const newEmail = prompt("Novo Email:", email);
    if(newEmail === null) return;

    const newCpf = prompt("Novo CPF (somente números):", cpf);
    if(newCpf === null) return;

    if (newName && newEmail) {
        try {
            const res = await fetch(`${API_URL}/users/${id}`, {
                method: 'PUT',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: newName, email: newEmail, cpf: newCpf })
            });

            if (res.ok) {
                showToast("Dados atualizados com sucesso!");
                fetchStudents();
            } else {
                showToast("Erro ao atualizar (Verifique e-mail/CPF duplicados).", "error");
            }
        } catch (e) {
            showToast("Erro de conexão.", "error");
        }
    }
}

// --- UTILITÁRIO DE TOAST INTERNO (Para não depender de arquivos externos) ---
function showToast(msg, type = "success") {
    if (typeof Toastify === 'function') {
        Toastify({
            text: msg,
            duration: 3000,
            gravity: "top",
            position: "right",
            style: {
                background: type === "error" ? "#ef4444" : "#D4AF37",
                color: type === "error" ? "#fff" : "#000",
                boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
            }
        }).showToast();
    } else {
        alert(msg);
    }
}