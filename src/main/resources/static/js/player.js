const API_URL = "http://localhost:8081";

document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    loadCourseContent();
    setupLogout();
});

function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) window.location.href = "/auth/login.html";
}

async function loadCourseContent() {
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get("id");
    const courseTitle = params.get("title");

    if (!courseId) {
        window.location.href = "/aluno/area-aluno.html";
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

        if (modules.length > 0 && modules[0].lessons.length > 0) {
            playLesson(modules[0].lessons[0]);
        }
    } catch (error) {
        console.error(error);
    }
}

function renderSidebar(modules) {
    const container = document.getElementById("modules-container");
    if (!container) return;
    container.innerHTML = "";

    modules.forEach((mod, index) => {
        let lessonsHtml = mod.lessons && mod.lessons.length > 0
            ? mod.lessons.map(lesson => `
                <li class="lesson-item cursor-pointer p-3 flex items-center gap-3 hover:bg-white/5 transition border-l-2 border-transparent hover:border-gold group"
                    data-lesson-info='${JSON.stringify(lesson).replace(/'/g, "&apos;")}'>
                    <div class="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[10px] text-gray-400 group-hover:bg-gold group-hover:text-black transition">
                        <i class="fas fa-play"></i>
                    </div>
                    <div>
                        <p class="text-xs text-gray-300 group-hover:text-white">${lesson.title}</p>
                    </div>
                </li>`).join("")
            : "<li class='p-3 text-xs text-gray-600 italic'>Em breve...</li>";

        container.innerHTML += `
            <div class="border-b border-gray-800">
                <button class="w-full bg-[#151515] p-4 flex items-center justify-between hover:bg-[#1a1a1a] transition" onclick="toggleModule('mod-${index}')">
                    <div>
                        <p class="text-[10px] text-gold uppercase tracking-widest font-bold">Módulo ${index + 1}</p>
                        <h4 class="text-sm font-bold text-white mt-1">${mod.title}</h4>
                    </div>
                    <i class="fas fa-chevron-down text-gray-500 transition-transform" id="icon-mod-${index}"></i>
                </button>
                <ul id="mod-${index}" class="hidden bg-black/40">${lessonsHtml}</ul>
            </div>`;
    });

    document.querySelectorAll('.lesson-item').forEach(item => {
        item.addEventListener('click', () => {
            const lessonData = JSON.parse(item.getAttribute('data-lesson-info'));
            playLesson(lessonData);
        });
    });
}

window.playLesson = function(lesson) {
    const iframe = document.getElementById("video-player");
    const titleDisplay = document.getElementById("current-lesson-title");
    const btnComplete = document.getElementById("btn-complete-lesson");

    if (iframe) iframe.src = getEmbedUrl(lesson.videoUrl);
    if (titleDisplay) titleDisplay.textContent = lesson.title;
    if (btnComplete) btnComplete.onclick = () => markAsCompleted(lesson.id);

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

async function markAsCompleted(lessonId) {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API_URL}/progress/${lessonId}`, {
            method: 'POST',
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) alert("Aula marcada como concluída! 🎓");
    } catch (e) { console.error(e); }
}

function getEmbedUrl(url) {
    if (!url || url.includes("/embed/")) return url;
    let videoId = url.includes("v=") ? url.split("v=")[1].split("&")[0] : url.split("youtu.be/")[1];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
}

function toggleModule(id) {
    const el = document.getElementById(id);
    const icon = document.getElementById(`icon-${id}`);
    if (el) {
        el.classList.toggle("hidden");
        if(icon) icon.classList.toggle("rotate-180");
    }
}

function setupLogout() {
    document.getElementById("btn-logout")?.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "/auth/login.html";
    });
}