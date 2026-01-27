// player.js - CONTROLE DO PLAYER
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8081"
    : "https://odonto-backend-j9oy.onrender.com";

const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {
    if (!token) { window.location.href = "/auth/login.html"; return; }
    loadCourseContent();
});

// 1. CARREGAMENTO DO CURSO
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
        const response = await fetch(`${API_URL}/courses/${courseId}/modules`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            window.location.href = "/auth/login.html";
            return;
        }

        const modules = await response.json();
        renderSidebar(modules);

        // Toca a primeira aula automaticamente
        if (modules.length > 0 && modules[0].lessons && modules[0].lessons.length > 0) {
            playLesson(modules[0].lessons[0]);
        }
    } catch (error) {
        showToast("Erro ao carregar aulas.", "error");
    }
}

// 2. RENDERIZA SIDEBAR
function renderSidebar(modules) {
    const container = document.getElementById("modules-container");
    if (!container) return;
    container.innerHTML = "";

    modules.forEach((mod, index) => {
        let lessonsHtml = mod.lessons && mod.lessons.length > 0
            ? mod.lessons.map(lesson => {
                // Truque para escapar aspas no JSON
                const safeLesson = JSON.stringify(lesson).replace(/'/g, "&apos;").replace(/"/g, "&quot;");
                return `
                <li class="lesson-item cursor-pointer p-4 flex items-center gap-4 hover:bg-white/5 transition border-l-2 border-transparent hover:border-gold group"
                    onclick='playLesson(${safeLesson})'>
                    <div class="w-8 h-8 rounded-full bg-dark-900 border border-white/10 flex items-center justify-center text-[10px] text-gray-500 group-hover:border-gold group-hover:text-gold transition">
                        <i class="fas fa-play"></i>
                    </div>
                    <div>
                        <p class="text-[11px] font-medium text-gray-400 group-hover:text-white transition">${lesson.title}</p>
                    </div>
                </li>`;
            }).join("")
            : "<li class='p-4 text-[10px] text-gray-600 italic tracking-widest'>Em breve...</li>";

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
}

// 3. TOCA O VÍDEO
window.playLesson = function(lesson) {
    const iframe = document.getElementById("video-player");
    const titleDisplay = document.getElementById("current-lesson-title");
    const btnComplete = document.getElementById("btn-complete-lesson");

    if (iframe) iframe.src = getEmbedUrl(lesson.videoUrl);
    if (titleDisplay) titleDisplay.textContent = lesson.title;

    if (btnComplete) {
        // Reseta o botão para o estado original
        btnComplete.innerHTML = 'Concluir Aula <i class="fas fa-check ml-2"></i>';
        btnComplete.classList.remove("opacity-50", "cursor-not-allowed");
        btnComplete.disabled = false;

        // Define a nova ação
        btnComplete.onclick = function() { markAsCompleted(this, lesson.id); };
    }

    // Rola para o topo suavemente em mobile
    if (window.innerWidth < 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// 4. CONCLUIR AULA
async function markAsCompleted(btn, lessonId) {
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/progress/${lessonId}`, {
            method: 'POST',
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
            showToast("Aula concluída! 🎓");
            localStorage.setItem("refreshProgress", "true");
            btn.innerHTML = '<i class="fas fa-check mr-2"></i> Concluída';
            btn.classList.add("opacity-50", "cursor-not-allowed");
        } else {
            showToast("Erro ao salvar progresso.", "error");
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    } catch (e) {
        showToast("Erro de conexão.", "error");
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// 5. UTILITÁRIOS
function getEmbedUrl(url) {
    if (!url) return "";
    try {
        let videoId = "";
        if (url.includes("v=")) {
            videoId = url.split("v=")[1].split("&")[0];
        } else if (url.includes("youtu.be/")) {
            videoId = url.split("youtu.be/")[1].split("?")[0];
        } else if (url.includes("/embed/")) {
            return url; // Já é embed
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : url;
    } catch (e) { return url; }
}

window.toggleModule = function(id) {
    const el = document.getElementById(id);
    const icon = document.getElementById(`icon-${id}`);
    if (el) {
        el.classList.toggle("hidden");
        if(icon) icon.classList.toggle("rotate-180");
    }
};

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