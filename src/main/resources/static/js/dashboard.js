// ==========================================
// CONFIGURAÇÃO DA PORTA 8081
// ==========================================
// Se você estiver rodando localmente, use localhost.
// Se estiver num servidor real (IP), troque "localhost" pelo IP do servidor.
const BASE_URL = "http://localhost:8081";

document.addEventListener("DOMContentLoaded", () => {
    fetchDashboardStats();
    fetchAdminCourses();
});

// ==========================================
// 1. BUSCAR ESTATÍSTICAS (MOCK)
// ==========================================
async function fetchDashboardStats() {
    console.log("Carregando estatísticas...");
    // Apenas garante que os elementos existem antes de tentar alterar
    const elStudents = document.getElementById("total-students");
    const elCourses = document.getElementById("total-courses");

    if (elStudents) elStudents.textContent = "1.240";
    if (elCourses) elCourses.textContent = "8";
}

// ==========================================
// 2. BUSCAR LISTA DE CURSOS
// ==========================================
async function fetchAdminCourses() {
    const tableBody = document.querySelector("tbody");
    const token = localStorage.getItem("token");

    // DEBUG: Verificação inicial
    if (!token) {
        console.error("ERRO: Nenhum token encontrado no LocalStorage!");
        alert("Você não está logado.");
        // window.location.href = "/auth/login.html"; // Descomente se quiser redirecionar
        return;
    }

    if (!tableBody) return; // Se não houver tabela na página, para aqui.

    try {
        console.log(`Buscando cursos em: ${BASE_URL}/courses`);

        // ============================================================
        // AQUI ESTÁ A CORREÇÃO: Usando BASE_URL (porta 8081)
        // ============================================================
        const response = await fetch(`${BASE_URL}/courses`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        // Tratamento de erros de permissão
        if (response.status === 401 || response.status === 403) {
            console.error("Backend rejeitou o token. Status:", response.status);
            alert("Sessão expirada. Faça login novamente.");
            window.location.href = "/auth/login.html";
            return;
        }

        // Verifica se deu erro no servidor (ex: 404, 500)
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        const courses = await response.json();
        tableBody.innerHTML = "";

        if (courses.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-gray-500">Nenhum curso encontrado.</td></tr>`;
            return;
        }

        courses.forEach(course => {
            // Garante que o preço seja um número para evitar erro no toFixed
            const price = parseFloat(course.price);

            const row = `
                <tr class="hover:bg-gray-50 transition border-b border-gray-100">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                ${course.title ? course.title.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-bold text-gray-900">${course.title}</div>
                                <div class="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full inline-block mt-1">Ativo</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${course.category || 'Geral'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        R$ ${isNaN(price) ? '0.00' : price.toFixed(2)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="deleteCourse(${course.id})" class="text-red-600 hover:text-red-900" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

    } catch (error) {
        console.error("Erro fatal ao buscar cursos:", error);
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-red-500">Erro de conexão com a porta 8081.</td></tr>`;
    }
}

// ==========================================
// 3. DELETAR CURSO
// ==========================================
async function deleteCourse(id) {
    if (!confirm("Tem certeza?")) return;
    const token = localStorage.getItem("token");

    try {
        // ============================================================
        // CORREÇÃO AQUI TAMBÉM: Usando BASE_URL (porta 8081)
        // ============================================================
        const response = await fetch(`${BASE_URL}/courses/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            fetchAdminCourses();
        } else {
            alert("Erro ao excluir.");
        }
    } catch (e) {
        console.error("Erro ao deletar:", e);
        alert("Erro de conexão ao tentar deletar.");
    }
}