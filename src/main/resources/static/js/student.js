// ==========================================
// STUDENT COCKPIT (DASHBOARD INTELIGENTE)
// ==========================================
const API_URL = "http://localhost:8081";

document.addEventListener("DOMContentLoaded", () => {
    updateUserInfo();
    setupLogout();
    fetchMyLibrary();
});

async function fetchMyLibrary() {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/auth/login.html"; return; }

    const gridContainer = document.getElementById("my-courses-grid");
    const heroArea = document.getElementById("continue-watching-area");
    const emptyArea = document.getElementById("welcome-empty");

    gridContainer.innerHTML = `<div class="col-span-full text-center py-10"><div class="animate-pulse h-4 w-4 bg-gold rounded-full mx-auto mb-2"></div><p class="text-xs text-gray-500">Carregando seus cursos...</p></div>`;

    try {
        // 1. Busca TUDO
        const res = await fetch(`${API_URL}/courses`, { headers: { "Authorization": `Bearer ${token}` } });
        const allCourses = await res.json();

        // 2. Filtra MEUS cursos (Via LocalStorage Mock por enquanto)
        const myCourseIds = JSON.parse(localStorage.getItem("my_courses") || "[]");
        const myLibrary = allCourses.filter(c => myCourseIds.includes(c.id));

        // 3. Lógica de Exibição
        if (myLibrary.length > 0) {
            emptyArea.classList.add("hidden");

            // --- DESTAQUE HERO (O último curso ou o primeiro da lista) ---
            // Vamos pegar o primeiro da lista para ser o "Em Andamento"
            const activeCourse = myLibrary[0];
            renderHero(activeCourse);
            heroArea.classList.remove("hidden");

            // --- GRID (Todos os cursos) ---
            renderLibraryGrid(myLibrary);
        } else {
            heroArea.classList.add("hidden");
            emptyArea.classList.remove("hidden");
            gridContainer.innerHTML = "";
        }

    } catch (e) { console.error(e); }
}

function renderHero(course) {
    const imgLink = course.imageUrl || course.image_url || "https://images.unsplash.com/photo-1628177142898-93e48732b86a?q=80&w=1000&auto=format&fit=crop";
    const link = `/aluno/player.html?id=${course.id}&title=${encodeURIComponent(course.title)}`;

    document.getElementById("hero-img").src = imgLink;
    document.getElementById("hero-title").textContent = course.title;
    document.getElementById("hero-category").textContent = (course.category || "Odontologia").toUpperCase();
    document.getElementById("hero-link").href = link;
    document.getElementById("hero-play-btn").href = link;
}

function renderLibraryGrid(list) {
    const container = document.getElementById("my-courses-grid");
    container.innerHTML = "";

    list.forEach(c => {
        const imgLink = c.imageUrl || c.image_url || "";
        const hasImg = imgLink.startsWith("http");
        const cover = hasImg ? `<img src="${imgLink}" class="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition duration-500 scale-100 group-hover:scale-110">` : `<div class="w-full h-full bg-gray-800 flex items-center justify-center"><i class="fas fa-tooth text-gray-600"></i></div>`;
        const link = `/aluno/player.html?id=${c.id}&title=${encodeURIComponent(c.title)}`;

        const html = `
            <a href="${link}" class="group relative bg-[#151515] border border-white/5 hover:border-gold/50 transition rounded-sm overflow-hidden h-48 block shadow-lg hover:shadow-[0_10px_30px_-10px_rgba(212,175,55,0.2)]">
                <div class="absolute inset-0">${cover}</div>
                <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 z-10">
                    <div class="w-10 h-10 rounded-full bg-gold text-black flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition duration-300">
                        <i class="fas fa-play ml-1 text-xs"></i>
                    </div>
                </div>

                <div class="absolute bottom-0 left-0 w-full p-4 z-20">
                    <p class="text-[9px] text-gold uppercase tracking-widest mb-1 truncate">${c.category || 'Curso'}</p>
                    <h3 class="text-sm font-bold text-white leading-tight group-hover:text-gold transition line-clamp-2">${c.title}</h3>
                </div>
            </a>`;
        container.innerHTML += html;
    });
}

function updateUserInfo() {
    const name = localStorage.getItem("userName") || "Doutor";
    const firstName = name.split(" ")[0];

    // Saudação Temporal
    const hour = new Date().getHours();
    let greeting = "Olá";
    if (hour >= 5 && hour < 12) greeting = "Bom dia";
    else if (hour >= 12 && hour < 18) greeting = "Boa tarde";
    else greeting = "Boa noite";

    if(document.getElementById("user-greeting")) document.getElementById("user-greeting").textContent = greeting;
    if(document.getElementById("user-name-display")) document.getElementById("user-name-display").textContent = `Dr(a). ${firstName}`;
}

function setupLogout() {
    document.getElementById("btn-logout").addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        window.location.href="/auth/login.html";
    });
}