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
    const grid = document.getElementById("my-courses-grid");
    try {
        const res = await fetch(`${API_URL}/enrollments/my-courses`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.status === 403 || res.status === 401) {
            localStorage.clear();
            window.location.href = "/auth/login.html";
            return;
        }

        const courses = await res.json();
        if (!courses || courses.length === 0) {
            renderEmptyState(grid); // Isso centraliza o botão da loja
            return;
        }

        // Mostra o Hero e renderiza a biblioteca
        document.getElementById("hero-section").style.display = "block";
        renderHero(courses[0]);
        renderLibrary(courses);

    } catch (e) {
        console.error("Erro na API:", e);
        if(grid) grid.innerHTML = `<p class="text-red-500 col-span-full text-center py-10 italic">Erro ao sincronizar biblioteca. Verifique se o seu Java está rodando.</p>`;
    }
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
            <p class="text-gray-500 text-sm mb-12 leading-relaxed px-6">
                Você ainda não possui protocolos ativos. Explore nossa coleção exclusiva e eleve o padrão do seu consultório.
            </p>
            <a href="/aluno/catalogo.html"
               class="inline-block px-14 py-5 bg-gold text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-full hover:scale-105 transition-all shadow-[0_20px_50px_rgba(212,175,55,0.2)]">
                Acessar Coleção 2026
            </a>
        </div>
    `;
}

function renderHero(data) {
    const heroArea = document.getElementById("continue-watching-area");
    if (!heroArea || !data) return;

    // LÓGICA DE COMPATIBILIDADE: Pega o curso se vier dentro de enrollment ou direto
    const course = data.course ? data.course : data;
    const progress = data.progressPercentage || 0;

    heroArea.classList.remove("hidden");
    document.getElementById("hero-title").innerText = course.title;
    document.getElementById("hero-category").innerText = course.category || "CURSO EM ANDAMENTO";
    document.getElementById("hero-img").src = course.imageUrl || "https://images.unsplash.com/photo-1628177142898-93e48732b86a?q=80&w=1000";

    // Atualiza progresso no banner
    const bar = heroArea.querySelector(".bg-gold");
    if(bar) bar.style.width = `${progress}%`;

    const link = `/assistir.html?id=${course.id}`;
    document.getElementById("hero-link").href = link;
    document.getElementById("hero-play-btn").href = link;
}

function renderLibrary(list) {
    const grid = document.getElementById("my-courses-grid");
    if (!grid) return;

    grid.className = "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6";
    grid.innerHTML = list.map(item => {
        // LÓGICA DE COMPATIBILIDADE: Suporta a estrutura de Enrollment do seu Java
        const course = item.course ? item.course : item;
        const progress = item.progressPercentage || 0;
        const img = course.imageUrl || "https://via.placeholder.com/400x225";

        return `
        <div class="group bg-[#1a1a1a] border border-white/5 hover:border-gold/30 rounded-sm overflow-hidden transition duration-300 flex flex-col">
            <div class="relative h-40 overflow-hidden">
                <img src="${img}" class="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-80 group-hover:opacity-100">
                <a href="/assistir.html?id=${course.id}" class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                    <div class="w-10 h-10 rounded-full bg-gold text-black flex items-center justify-center shadow-lg"><i class="fas fa-play text-xs"></i></div>
                </a>
            </div>
            <div class="p-5 flex flex-col flex-grow">
                <span class="text-[9px] text-gold uppercase tracking-widest mb-2">${course.category || 'MÓDULO'}</span>
                <h4 class="text-white font-serif text-lg leading-tight mb-4">${course.title}</h4>
                <div class="mt-auto">
                    <div class="w-full bg-gray-800 h-1 rounded-full overflow-hidden mb-2">
                        <div class="bg-gold h-full" style="width: ${progress}%"></div>
                    </div>
                    <p class="text-[8px] text-gray-500 uppercase tracking-widest text-right">${progress}%</p>
                </div>
            </div>
        </div>`;
    }).join("");
}