// ==========================================
// PLAYER DE VÍDEO (INTEGRADO AO BACKEND)
// ==========================================

const API_URL = "http://localhost:8081";

document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    loadCourseContent();
    setupLogout();
});

// 1. Verifica se tem Login
function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/auth/login.html";
    }
}

// 2. Carrega Módulos e Aulas
async function loadCourseContent() {
    // Pega o ID do curso da URL (ex: player.html?id=1)
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get("id");
    const courseTitle = params.get("title");

    if (!courseId) {
        alert("Curso não identificado.");
        window.location.href = "/aluno/area-aluno.html";
        return;
    }

    // Preenche o título na tela (se tiver elemento pra isso)
    const titleEl = document.getElementById("course-title-display");
    if(titleEl && courseTitle) titleEl.textContent = decodeURIComponent(courseTitle);

    try {
        const token = localStorage.getItem("token");

        // CHAMA SEU BACKEND NOVO 🚀
        const response = await fetch(`${API_URL}/courses/${courseId}/modules`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Erro ao carregar conteúdo");

        const modules = await response.json();
        renderSidebar(modules);

        // Se tiver pelo menos uma aula, já carrega a primeira no player
        if (modules.length > 0 && modules[0].lessons.length > 0) {
            playLesson(modules[0].lessons[0]);
        }

    } catch (error) {
        console.error(error);
        alert("Erro ao carregar as aulas. Tente novamente.");
    }
}

// 3. Monta o Menu Lateral (Accordion)
function renderSidebar(modules) {
    const container = document.getElementById("modules-container"); // Garanta que existe esse ID no HTML
    if (!container) return;

    container.innerHTML = "";

    if (modules.length === 0) {
        container.innerHTML = "<p class='text-gray-500 text-sm p-4'>Nenhuma aula cadastrada ainda.</p>";
        return;
    }

    modules.forEach((mod, index) => {
        // Cria o HTML de cada Aula dentro do Módulo
        let lessonsHtml = "";

        if (mod.lessons && mod.lessons.length > 0) {
            lessonsHtml = mod.lessons.map(lesson => `
                <li onclick='playLesson(${JSON.stringify(lesson)})'
                    class="cursor-pointer p-3 flex items-center gap-3 hover:bg-white/5 transition border-l-2 border-transparent hover:border-gold group">
                    <div class="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[10px] text-gray-400 group-hover:bg-gold group-hover:text-black transition">
                        <i class="fas fa-play"></i>
                    </div>
                    <div>
                        <p class="text-xs text-gray-300 group-hover:text-white">${lesson.title}</p>
                        <p class="text-[10px] text-gray-600">${formatDuration(lesson.durationSeconds)}</p>
                    </div>
                </li>
            `).join("");
        } else {
            lessonsHtml = "<li class='p-3 text-xs text-gray-600 italic'>Em breve...</li>";
        }

        // HTML do Módulo (Accordion)
        const html = `
            <div class="border-b border-gray-800">
                <button class="w-full bg-[#151515] p-4 flex items-center justify-between hover:bg-[#1a1a1a] transition text-left"
                        onclick="toggleModule('mod-${index}')">
                    <div>
                        <p class="text-[10px] text-gold uppercase tracking-widest font-bold">Módulo ${index + 1}</p>
                        <h4 class="text-sm font-bold text-white mt-1">${mod.title}</h4>
                    </div>
                    <i class="fas fa-chevron-down text-gray-500 transform transition-transform" id="icon-mod-${index}"></i>
                </button>
                <ul id="mod-${index}" class="hidden bg-black/40">
                    ${lessonsHtml}
                </ul>
            </div>
        `;
        container.innerHTML += html;
    });
}

// 4. Toca o Vídeo (Troca o Iframe)
window.playLesson = function(lesson) { // Global para funcionar no onclick
    const iframe = document.getElementById("video-player");
    const titleDisplay = document.getElementById("current-lesson-title");

    if (iframe) {
        // Converte link do Youtube comum para Embed
        const embedUrl = getEmbedUrl(lesson.videoUrl);
        iframe.src = embedUrl;
    }

    if (titleDisplay) {
        titleDisplay.textContent = lesson.title;
    }

    // Rola para o topo suavemente
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Helpers
function toggleModule(id) {
    const el = document.getElementById(id);
    const icon = document.getElementById(`icon-${id}`);
    if (el) {
        el.classList.toggle("hidden");
        if(icon) icon.classList.toggle("rotate-180");
    }
}

function getEmbedUrl(url) {
    if (!url) return "";
    // Se já for embed, retorna
    if (url.includes("/embed/")) return url;

    // Extrai ID do Youtube (suporta v=ID ou youtu.be/ID)
    let videoId = "";
    if (url.includes("v=")) {
        videoId = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1];
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : url;
}

function formatDuration(seconds) {
    if(!seconds) return "";
    const min = Math.floor(seconds / 60);
    return `${min} min`;
}

function setupLogout() {
    const btn = document.getElementById("btn-logout");
    if (btn) {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "/auth/login.html";
        });
    }
}