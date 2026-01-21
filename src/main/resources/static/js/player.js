// ==========================================
// CONTROLE DO PLAYER E PROGRESSO - ODONTOPRO
// ==========================================
const API_URL = "http://localhost:8081"; // Porta oficial do Felipe

document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    updateUserInfo(); // Garante o nome do usuário na Navbar
    loadCourseContent();
    setupLogout();
});

function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) window.location.href = "/auth/login.html";
}

// 1. CARREGAMENTO DINÂMICO DE CONTEÚDO
async function loadCourseContent() {
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get("id");
    const courseTitle = params.get("title");

    if (!courseId) {
        window.location.href = "/aluno/catalogo.html";
        return;
    }

    const titleEl = document.getElementById("course-title-display");
    if(titleEl && courseTitle) titleEl.textContent = decodeURIComponent(courseTitle);

    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/courses/${courseId}/modules`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Erro ao carregar conteúdo");

        const modules = await response.json();
        renderSidebar(modules);

        // Auto-play da primeira aula disponível
        if (modules.length > 0 && modules[0].lessons && modules[0].lessons.length > 0) {
            playLesson(modules[0].lessons[0]);
        }
    } catch (error) {
        if (typeof UI !== 'undefined') UI.toast.error("Erro ao sincronizar módulos.");
    }
}

// 2. RENDERIZAÇÃO DA SIDEBAR LUXURY
function renderSidebar(modules) {
    const container = document.getElementById("modules-container");
    if (!container) return;
    container.innerHTML = "";

    modules.forEach((mod, index) => {
        let lessonsHtml = mod.lessons && mod.lessons.length > 0
            ? mod.lessons.map(lesson => `
                <li class="lesson-item cursor-pointer p-4 flex items-center gap-4 hover:bg-white/5 transition border-l-2 border-transparent hover:border-gold group"
                    data-lesson-info='${JSON.stringify(lesson).replace(/'/g, "&apos;")}'>
                    <div class="w-8 h-8 rounded-full bg-dark-900 border border-white/10 flex items-center justify-center text-[10px] text-gray-500 group-hover:border-gold group-hover:text-gold transition">
                        <i class="fas fa-play"></i>
                    </div>
                    <div>
                        <p class="text-[11px] font-medium text-gray-400 group-hover:text-white transition">${lesson.title}</p>
                    </div>
                </li>`).join("")
            : "<li class='p-4 text-[10px] text-gray-600 italic tracking-widest'>Conteúdo em breve...</li>";

        container.innerHTML += `
            <div class="border-b border-white/5">
                <button class="w-full bg-black p-5 flex items-center justify-between hover:bg-white/5 transition" onclick="toggleModule('mod-${index}')">
                    <div class="text-left">
                        <p class="text-[9px] text-gold uppercase tracking-[0.3em] font-bold">Módulo ${index + 1}</p>
                        <h4 class="text-xs font-bold text-white mt-1 uppercase tracking-wider">${mod.title}</h4>
                    </div>
                    <i class="fas fa-chevron-down text-gray-600 text-xs transition-transform" id="icon-mod-${index}"></i>
                </button>
                <ul id="mod-${index}" class="hidden bg-dark-950/50">${lessonsHtml}</ul>
            </div>`;
    });

    // Eventos de clique nas aulas
    document.querySelectorAll('.lesson-item').forEach(item => {
        item.addEventListener('click', () => {
            const lessonData = JSON.parse(item.getAttribute('data-lesson-info'));
            playLesson(lessonData);
        });
    });
}

// 3. CONTROLE DO PLAYER
window.playLesson = function(lesson) {
    const iframe = document.getElementById("video-player");
    const titleDisplay = document.getElementById("current-lesson-title");
    const btnComplete = document.getElementById("btn-complete-lesson");

    if (iframe) iframe.src = getEmbedUrl(lesson.videoUrl);
    if (titleDisplay) titleDisplay.textContent = lesson.title;

    // Atualiza o gatilho de conclusão para a aula atual
    if (btnComplete) {
        btnComplete.onclick = function() { markAsCompleted(this, lesson.id); };
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 4. CONCLUSÃO DE AULA (CONEXÃO REAL BACKEND)
async function markAsCompleted(btn, lessonId) {
    const token = localStorage.getItem("token");

    // UX: Feedback de carregamento
    if (typeof UI !== 'undefined') UI.buttonLoading(btn, true, "Registrando...");

    try {
        const res = await fetch(`${API_URL}/progress/${lessonId}`, {
            method: 'POST',
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
            if (typeof UI !== 'undefined') UI.toast.success("Aula concluída com sucesso! 🎓");
            btn.innerHTML = '<i class="fas fa-check mr-2"></i> Concluída';
            btn.classList.add("opacity-50", "cursor-not-allowed");
            btn.onclick = null;
        } else {
            throw new Error();
        }
    } catch (e) {
        if (typeof UI !== 'undefined') UI.toast.error("Erro ao salvar progresso.");
    } finally {
        if (typeof UI !== 'undefined') UI.buttonLoading(btn, false, "Concluir Aula");
    }
}

// 5. UTILITÁRIOS
function getEmbedUrl(url) {
    if (!url) return "";
    if (url.includes("/embed/")) return url + "?autoplay=1&rel=0";

    let videoId = "";
    if (url.includes("v=")) {
        videoId = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1].split("?")[0];
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : url;
}

function toggleModule(id) {
    const el = document.getElementById(id);
    const icon = document.getElementById(`icon-${id}`);
    if (el) {
        el.classList.toggle("hidden");
        if(icon) icon.classList.toggle("rotate-180");
    }
}

function updateUserInfo() {
    const user = JSON.parse(localStorage.getItem("user") || "{}"); // Sincronizado com auth.js
    const el = document.getElementById("user-name-display");
    if (el && user.name) el.textContent = user.name;
}

function setupLogout() {
    document.getElementById("btn-logout")?.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "/auth/login.html";
    });
}