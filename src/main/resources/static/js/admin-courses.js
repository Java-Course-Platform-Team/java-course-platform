// admin-courses.js - GESTÃO ELITE DE CURSOS ODONTOPRO
//  CONFIGURAÇÃO AUTOMÁTICA DE AMBIENTE
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8081"                  // Se estou no PC, uso IntelliJ Local
    : "https://odonto-backend-j9oy.onrender.com"; // Se estou na Web, uso a Nuvem
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {
    if (!token) { window.location.href = "/auth/login.html"; return; }
    fetchCourses();
    setupSearch();
});

// 1. BUSCA CURSOS DIRETAMENTE DO BANCO
async function fetchCourses() {
    try {
        const res = await fetch(`${API_URL}/courses`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const courses = await res.json();
        renderCoursesList(courses);
    } catch (e) {
        console.error("Erro ao conectar com o banco de dados.");
    }
}

// 2. RENDERIZA A LISTA COM O BOTÃO DE GERENCIAR AULAS
function renderCoursesList(courses) {
    const container = document.getElementById("courses-admin-list");
    if (!container) return;

    if (courses.length === 0) {
        container.innerHTML = `<p class="text-center py-10 text-gray-600 italic">Nenhum curso cadastrado no sistema.</p>`;
        return;
    }

    container.innerHTML = courses.map(c => `
        <div class="bg-panel border border-white/5 p-6 rounded flex items-center justify-between group hover:border-gold/30 transition-all duration-500">
            <div class="flex items-center gap-6">
                <div class="w-16 h-16 bg-black rounded overflow-hidden border border-white/10 shrink-0">
                    <img src="${c.imageUrl || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09'}"
                         class="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition duration-700">
                </div>
                <div>
                    <h3 class="text-white font-bold group-hover:text-gold transition-colors">${c.title}</h3>
                    <div class="flex gap-4 mt-1">
                        <span class="text-[10px] text-gray-500 uppercase tracking-widest">${c.category || 'Geral'}</span>
                        <span class="text-[10px] text-gold font-mono">R$ ${parseFloat(c.price).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div class="flex items-center gap-3">
                <a href="/admin/gerenciar-aulas.html?id=${c.id}&title=${encodeURIComponent(c.title)}"
                   class="bg-white/5 hover:bg-gold hover:text-black p-3 rounded text-xs font-bold uppercase tracking-tighter transition-all flex items-center gap-2"
                   title="Gerenciar Módulos e Aulas">
                    <i class="fas fa-layer-group"></i>
                    <span>Aulas</span>
                </a>

                <button onclick="editCourse('${c.id}')" class="p-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded transition" title="Editar Informações">
                    <i class="fas fa-edit"></i>
                </button>

                <button onclick="deleteCourse('${c.id}')" class="p-3 bg-white/5 hover:bg-red-500/20 text-gray-600 hover:text-red-500 rounded transition" title="Excluir Curso">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join("");
}

// 3. EXCLUSÃO REAL NO BANCO DE DADOS
async function deleteCourse(id) {
    if (confirm("ATENÇÃO: Isso excluirá o curso, módulos e aulas permanentemente. Confirmar?")) {
        try {
            const res = await fetch(`${API_URL}/courses/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                // UI.toast.success("Curso removido com sucesso.");
                fetchCourses();
            }
        } catch (e) {
            alert("Erro ao excluir curso.");
        }
    }
}

// 4. EDIÇÃO (REDIRECIONA PARA O FORMULÁRIO COM O ID)
function editCourse(id) {
    window.location.href = `/admin/form-curso.html?edit=${id}`;
}

// 5. SISTEMA DE BUSCA REATIVO
function setupSearch() {
    const input = document.getElementById("search-courses");
    input?.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = Array.from(document.querySelectorAll("#courses-admin-list > div")).forEach(card => {
            const title = card.querySelector("h3").textContent.toLowerCase();
            card.style.display = title.includes(term) ? "flex" : "none";
        });
    });
}