// admin-content.js - Gerenciamento de Módulos e Aulas
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8081"
    : "https://odonto-backend-j9oy.onrender.com";

const token = localStorage.getItem("token");
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('id');
const courseTitle = urlParams.get('title');

document.addEventListener("DOMContentLoaded", () => {
    if (!token) { window.location.href = "/auth/login.html"; return; }
    if (!courseId) { window.location.href = "gerenciar-cursos.html"; return; }

    // Mostra o título do curso no topo, se houver elemento para isso
    const titleEl = document.getElementById('course-title-display');
    if (titleEl && courseTitle) titleEl.textContent = decodeURIComponent(courseTitle);

    loadContentFromBackend();
});

async function loadContentFromBackend() {
    try {
        const res = await fetch(`${API_URL}/courses/${courseId}/modules`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.status === 401 || res.status === 403) {
            localStorage.clear();
            window.location.href = "/auth/login.html";
            return;
        }

        const modules = await res.json();
        renderModules(modules);
    } catch (e) {
        showToast("Erro ao carregar conteúdo.", "error");
    }
}

async function addModule() {
    const title = prompt("Título do Novo Módulo:");
    if (!title) return;

    try {
        const res = await fetch(`${API_URL}/courses/modules`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ title: title, courseId: courseId }) // courseId é String (UUID)
        });

        if (res.ok) {
            showToast("Módulo criado com sucesso!");
            loadContentFromBackend();
        } else {
            showToast("Erro ao criar módulo.", "error");
        }
    } catch (e) { showToast("Erro de conexão.", "error"); }
}

async function addLesson(moduleId) {
    const title = prompt("Título da Aula:");
    const videoUrl = prompt("Link do Vídeo (Youtube/Vimeo):");
    if (!title || !videoUrl) return;

    try {
        const res = await fetch(`${API_URL}/courses/lessons`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                title: title,
                videoUrl: videoUrl,
                moduleId: moduleId
            })
        });

        if (res.ok) {
            showToast("Aula adicionada!");
            loadContentFromBackend();
        } else {
            showToast("Erro ao salvar aula.", "error");
        }
    } catch (e) { showToast("Erro de conexão.", "error"); }
}

// --- FUNÇÃO DE RENDERIZAÇÃO (ESTAVA FALTANDO) ---
// --- FUNÇÃO DE RENDERIZAÇÃO ATUALIZADA (RESPONSIVA) ---
function renderModules(modules) {
    const container = document.getElementById("modules-container");
    if (!container) return;
    container.innerHTML = "";

    if (modules.length === 0) {
        container.innerHTML = '<p class="text-gray-500 italic">Nenhum módulo criado ainda.</p>';
        return;
    }

    modules.forEach(mod => {
        // MODIFICADO: Ajustado flex-col no mobile para as aulas não cortarem o texto
        const lessonsHtml = mod.lessons && mod.lessons.length > 0
            ? mod.lessons.map(lesson => `
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-black/30 p-3 rounded border border-white/5 ml-2 sm:ml-4 mt-2 gap-2">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-play-circle text-gray-400"></i>
                        <span class="text-sm text-gray-300">${lesson.title}</span>
                    </div>
                    <a href="${lesson.videoUrl}" target="_blank" class="text-[10px] sm:text-xs text-gold hover:underline shrink-0">Ver vídeo</a>
                </div>
              `).join('')
            : '<p class="text-xs text-gray-600 ml-4 mt-2 italic">Nenhuma aula neste módulo.</p>';

        // MODIFICADO: Ajustado o padding e o tamanho do texto para telas pequenas
        const moduleHtml = `
            <div class="bg-panel border border-white/10 rounded mb-6 overflow-hidden">
                <div class="bg-white/5 p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h3 class="font-bold text-white uppercase tracking-wider text-xs sm:text-sm">${mod.title}</h3>
                    <button onclick="addLesson('${mod.id}')" class="w-full sm:w-auto text-[10px] bg-gold text-black px-3 py-2 sm:py-1 font-bold uppercase rounded hover:bg-white transition">
                        + Nova Aula
                    </button>
                </div>
                <div class="p-3 sm:p-4">
                    ${lessonsHtml}
                </div>
            </div>
        `;
        container.innerHTML += moduleHtml;
    });
}

// Helper para Toastify
function showToast(msg, type = "success") {
    if (typeof Toastify === 'function') {
        Toastify({
            text: msg,
            duration: 3000,
            style: { background: type === "error" ? "#ef4444" : "#D4AF37", color: type === "error" ? "#fff" : "#000" }
        }).showToast();
    } else {
        alert(msg);
    }
}