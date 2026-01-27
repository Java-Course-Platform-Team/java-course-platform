// js/student.js - VERSÃO ALINHADA COM SEU JAVA ATUAL
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8081"
    : "https://odonto-backend-j9oy.onrender.com";

const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {
    if (!token) { window.location.href = "/auth/login.html"; return; }

    loadUserName();
    fetchMyCourses();
});

function loadUserName() {
    const userName = localStorage.getItem("userName") || "Doutor(a)";
    const display = document.getElementById("user-name-display");
    if(display) display.innerText = userName;
}

async function fetchMyCourses() {
    try {
        // CORREÇÃO 1: A rota exata do seu Controller Java
        console.log("Buscando em:", `${API_URL}/enrollments/my-courses`);

        const res = await fetch(`${API_URL}/enrollments/my-courses`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.status === 403 || res.status === 401) {
            localStorage.clear();
            window.location.href = "/auth/login.html";
            return;
        }

        const courses = await res.json();
        console.log("MEUS CURSOS (Java):", courses);

        if (!courses || courses.length === 0) {
            document.getElementById("welcome-empty").classList.remove("hidden");
            document.getElementById("my-courses-grid").innerHTML = "";
        } else {
            document.getElementById("welcome-empty").classList.add("hidden");
            // Passamos o primeiro curso para o destaque
            renderHero(courses[0]);
            renderLibrary(courses);
        }

    } catch (e) {
        console.error(e);
        const grid = document.getElementById("my-courses-grid");
        if(grid) grid.innerHTML = `<p class="text-red-500 col-span-full text-center">Erro ao carregar cursos.</p>`;
    }
}

function renderHero(course) {
    // CORREÇÃO 2: Seu Java devolve o curso direto, não precisa de .course
    const heroArea = document.getElementById("continue-watching-area");

    if(heroArea && course) {
        heroArea.classList.remove("hidden");

        document.getElementById("hero-title").innerText = course.title;
        document.getElementById("hero-category").innerText = course.category || "Curso Premium";

        const img = course.imageUrl || "https://images.unsplash.com/photo-1628177142898-93e48732b86a?q=80&w=1000";
        document.getElementById("hero-img").src = img;

        const link = `/assistir.html?id=${course.id}`;
        document.getElementById("hero-link").href = link;
        document.getElementById("hero-play-btn").href = link;
    }
}

function renderLibrary(list) {
    const grid = document.getElementById("my-courses-grid");
    if (!grid) return;

    grid.innerHTML = list.map(course => {
        // CORREÇÃO 3: Acessamos as propriedades direto (course.title), pois o Java já converteu
        const img = course.imageUrl || "https://images.unsplash.com/photo-1628177142898-93e48732b86a?q=80&w=1000";

        return `
        <div class="group bg-[#1a1a1a] border border-white/5 hover:border-gold/30 rounded-sm overflow-hidden transition duration-300 flex flex-col">
            <div class="relative h-40 overflow-hidden">
                <img src="${img}" class="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-80 group-hover:opacity-100">
                <div class="absolute inset-0 bg-black/50 group-hover:bg-transparent transition"></div>

                <a href="/assistir.html?id=${course.id}" class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                    <div class="w-10 h-10 rounded-full bg-gold text-black flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition">
                        <i class="fas fa-play text-xs"></i>
                    </div>
                </a>
            </div>

            <div class="p-5 flex flex-col flex-grow">
                <span class="text-[9px] text-gold uppercase tracking-widest mb-2">${course.category || 'MÓDULO'}</span>
                <h4 class="text-white font-serif text-lg leading-tight mb-2 group-hover:text-gold transition">${course.title}</h4>
                <div class="w-full bg-gray-800 h-1 mt-auto rounded-full overflow-hidden">
                    <div class="bg-gold w-[0%] h-full"></div>
                </div>
            </div>
        </div>
        `;
    }).join("");
}