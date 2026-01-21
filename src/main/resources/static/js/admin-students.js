const API_URL = "http://localhost:8081";
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", fetchStudents);

async function fetchStudents() {
    try {
        const res = await fetch(`${API_URL}/users`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const students = await res.json();
        renderTable(students);
    } catch (e) {
        UI.toast.error("Erro ao carregar alunos.");
    }
}

function renderTable(list) {
    const tbody = document.getElementById("students-table-body");
    tbody.innerHTML = list.map(s => `
        <tr class="hover:bg-white/5 transition">
            <td class="px-8 py-4 text-white font-bold">${s.name}</td>
            <td class="px-8 py-4 text-sm text-gray-500">${s.email}</td>
            <td class="px-8 py-4 text-sm text-gray-500">${s.cpf || '---'}</td>
            <td class="px-8 py-4">
                <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase ${s.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}">
                    ${s.isActive ? 'Ativo' : 'Banido'}
                </span>
            </td>
            <td class="px-8 py-4 text-right space-x-2">
                <button onclick="editStudent('${s.id}', '${s.name}', '${s.email}', '${s.cpf}')" class="text-gray-400 hover:text-blue-400" title="Editar"><i class="fas fa-edit"></i></button>
                <button onclick="toggleStatus('${s.id}')" class="text-gray-400 hover:text-gold" title="Alternar Status"><i class="fas fa-ban"></i></button>
                <button onclick="resetPassword('${s.id}')" class="text-gray-400 hover:text-green-400" title="Resetar Senha"><i class="fas fa-key"></i></button>
                <button onclick="deleteUser('${s.id}')" class="text-gray-400 hover:text-red-500" title="Excluir Permanentemente"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join("");
}

async function toggleStatus(id) {
    await fetch(`${API_URL}/users/${id}/toggle-status`, {
        method: 'PATCH',
        headers: { "Authorization": `Bearer ${token}` }
    });
    fetchStudents();
}

async function resetPassword(id) {
    if(confirm("Deseja resetar a senha deste aluno para 'odonto123'?")) {
        await fetch(`${API_URL}/users/${id}/reset-password`, {
            method: 'PATCH',
            headers: { "Authorization": `Bearer ${token}` }
        });
        UI.toast.success("Senha resetada com sucesso.");
    }
}

async function deleteUser(id) {
    if(confirm("AVISO CRÍTICO: Esta ação excluirá permanentemente o aluno e todo o seu progresso. Continuar?")) {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: { "Authorization": `Bearer ${token}` }
        });
        if(res.ok) {
            UI.toast.success("Usuário removido do banco.");
            fetchStudents();
        }
    }
}

function editStudent(id, name, email, cpf) {
    const newName = prompt("Novo Nome:", name);
    const newEmail = prompt("Novo Email:", email);
    const newCpf = prompt("Novo CPF:", cpf);

    if (newName && newEmail) {
        fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: newName, email: newEmail, cpf: newCpf })
        }).then(() => fetchStudents());
    }
}