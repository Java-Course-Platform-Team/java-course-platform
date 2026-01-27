// js/student.js - VERSÃO BLINDADA (Compatível com Guilherme e seu HTML)

// 1. URL DINÂMICA (Funciona em Localhost e na Nuvem)
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8081"
    : "https://odonto-backend-j9oy.onrender.com";

const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {
    // Se não tem token, chuta pro login
    if (!token) {
        window.location.href = "/auth/login.html";
        return;
    }

    loadUserName();
    fetchMyCourses();
});

function loadUserName() {
    const userName = localStorage.getItem("userName") || "Doutor(a)";
    const display = document.getElementById("user-name-display");
    if (display) display.innerText = userName;
}

async function fetchMyCourses() {
    const grid = document.getElementById("my-courses-grid");
    const emptyMsg = document.getElementById("welcome-empty");
    const heroSection = document.getElementById("hero-section") || document.getElementById("continue-watching-area"); // Tenta os dois nomes

    try {
        console.log("🔍 Buscando cursos em:", `${API_URL}/enrollments/my-courses`);

        const res = await fetch(`${API_URL}/enrollments/my-courses`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        // Se o token venceu ou é inválido
        if (res.status === 403 || res.status === 401) {
            console.warn("⛔ Token expirado ou inválido. Redirecionando...");
            localStorage.clear();
            window.location.href = "/auth/login.html";
            return;
        }

       const courses = await res.json();
               console.log("📦 RESPOSTA DO JAVA:", courses);

               if (!courses || courses.length === 0) {
                   // CENÁRIO 1: LISTA VAZIA (Mostra botão centralizado e esconde o topo)
                   renderEmptyState(grid);
               } else {
                   // CENÁRIO 2: TEM CURSOS (Mostra o topo e renderiza a biblioteca)
                   const hero = document.getElementById("hero-section");
                   if (hero) hero.style.display = "block";

                   renderHero(courses[0]);
                   renderLibrary(courses);
               }
               // REMOVA qualquer código que estiver abaixo desta linha dentro da função

    } catch (e) {
        console.error("❌ ERRO CRÍTICO NO JS:", e);
        // Só mostra o erro na tela se o elemento grid existir
        if (grid) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-10">
                    <p class="text-red-500 font-bold">Erro ao sincronizar biblioteca.</p>
                    <p class="text-gray-500 text-sm mt-2">${e.message}</p>
                </div>`;
        }
    }
}

function renderHero(course) {
    // Tenta achar a seção com o ID novo ou o antigo
    const heroArea = document.getElementById("hero-section") || document.getElementById("continue-watching-area");

    if (heroArea && course) {
        heroArea.style.display = "block"; // Garante que aparece
        heroArea.classList.remove("hidden");

        // Mapeamento seguro dos elementos (com ? para não quebrar se faltar)
        const titleEl = document.getElementById("hero-title");
        const catEl = document.getElementById("hero-category");
        const imgEl = document.getElementById("hero-img");
        const linkEl = document.getElementById("hero-link"); // Botão "Continuar Assistindo"
        const btnEl = document.getElementById("hero-play-btn"); // Botão Play redondo (se tiver)

        // Preenche os dados
        if(titleEl) titleEl.innerText = course.title;
        if(catEl) catEl.innerText = course.category || "Curso Premium";
        
        const imageUrl = course.imageUrl || "https://images.unsplash.com/photo-1628177142898-93e48732b86a?q=80&w=1000";
        if(imgEl) imgEl.src = imageUrl;

        // Links
        const link = `/aluno/assistir.html?id=${course.id}`;
        if(linkEl) linkEl.href = link;
        if(btnEl) btnEl.href = link;
    }
}

function renderLibrary(list) {
    const grid = document.getElementById("my-courses-grid");
    if (!grid) return; // Se não tem grid, não faz nada (não quebra)

    grid.innerHTML = list.map(course => {
        const imageUrl = course.imageUrl || "https://images.unsplash.com/photo-1628177142898-93e48732b86a?q=80&w=1000";
        const progress = course.progress || 0;

        return `
        <div class="group bg-[#1a1a1a] border border-white/5 hover:border-gold/30 rounded-sm overflow-hidden transition duration-300 flex flex-col">
            <div class="relative h-40 overflow-hidden">
                <img src="${imageUrl}" class="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-80 group-hover:opacity-100">
                <div class="absolute inset-0 bg-black/50 group-hover:bg-transparent transition"></div>

                <a href="/aluno/assistir.html?id=${course.id}" class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                    <div class="w-10 h-10 rounded-full bg-gold text-black flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition">
                        <i class="fas fa-play text-xs"></i>
                    </div>
                </a>
            </div>

            <div class="p-5 flex flex-col flex-grow">
                <span class="text-[9px] text-gold uppercase tracking-widest mb-2">${course.category || 'MÓDULO'}</span>
                <h4 class="text-white font-serif text-lg leading-tight mb-2 group-hover:text-gold transition">
                    ${course.title}
                </h4>
                
                <div class="w-full bg-gray-800 h-1 mt-auto rounded-full overflow-hidden">
                   <div class="bg-gold h-full shadow-[0_0_10px_#D4AF37]" style="width: ${course.progressPercentage || 0}%"></div>
                </div>
            </div>
        </div>
        `;
    }).join("");
    
    // Garante as classes de grid
    grid.className = "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6";
}
    function renderEmptyState(container) {
        const hero = document.getElementById("hero-section");
        if (hero) hero.style.display = "none";

        container.innerHTML = "";
        container.className = "flex flex-col items-center justify-center py-20 text-center w-full col-span-full";
        container.innerHTML = `
            <div class="animate-fade-in-down max-w-lg">
                <i class="fas fa-gem text-gold text-7xl mb-8 opacity-20"></i>
                <h2 class="text-3xl font-serif text-white mb-4 italic">Sua Vitrine de Especialidades</h2>
                <p class="text-gray-500 text-sm mb-12 px-6">Você ainda não possui protocolos ativos. Explore nossa coleção exclusiva.</p>
                <a href="/aluno/catalogo.html" class="inline-block px-14 py-5 bg-gold text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-full shadow-[0_20px_50px_rgba(212,175,55,0.2)]">Acessar Coleção 2026</a>
            </div>`;
    }