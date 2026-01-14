// ==========================================
// STUDENT COCKPIT (CONECTADO AO BACKEND REAL)
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

    // Mostra loading
    gridContainer.innerHTML = `<div class="col-span-full text-center py-10"><div class="animate-pulse h-4 w-4 bg-gold rounded-full mx-auto mb-2"></div><p class="text-xs text-gray-500">Buscando suas matrículas...</p></div>`;

    try {
        // 🚀 AQUI ESTÁ A MUDANÇA: Chamamos o endpoint de Matrículas, não o de Cursos Gerais
        const res = await fetch(`${API_URL}/enrollments/my-courses`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (res.status === 403) {
            alert("Sessão expirada.");
            localStorage.removeItem("token");
            window.location.href = "/auth/login.html";
            return;
        }

        const myLibrary = await res.json();

        // 3. Lógica de Exibição
        if (myLibrary.length > 0) {
            emptyArea.classList.add("hidden");

            // --- DESTAQUE HERO (Pega o primeiro curso da lista como destaque) ---
            const activeCourse = myLibrary[0];
            renderHero(activeCourse);
            heroArea.classList.remove("hidden");

            // --- GRID (Lista todos) ---
            renderLibraryGrid(myLibrary);
        } else {
            // Se a lista vier vazia do Backend
            heroArea.classList.add("hidden");
            emptyArea.classList.remove("hidden");
            gridContainer.innerHTML = "";
        }

    } catch (e) {
        console.error("Erro ao buscar cursos:", e);
        gridContainer.innerHTML = `<p class="text-red-500 text-center col-span-full">Erro ao carregar sua biblioteca.</p>`;
    }
}

function renderHero(course) {
    const imgLink = course.imageUrl || "https://images.unsplash.com/photo-1628177142898-93e48732b86a?q=80&w=1000&auto=format&fit=crop";
    // Envia o ID e o Título para o Player via URL
    const link = `/aluno/player.html?id=${course.id}&title=${encodeURIComponent(course.title)}`;

    const heroImg = document.getElementById("hero-img");
    if(heroImg) heroImg.src = imgLink;

    const heroTitle = document.getElementById("hero-title");
    if(heroTitle) heroTitle.textContent = course.title;

    const heroCat = document.getElementById("hero-category");
    if(heroCat) heroCat.textContent = (course.category || "Odontologia").toUpperCase();

    const heroLink = document.getElementById("hero-link");
    if(heroLink) heroLink.href = link;

    const heroPlay = document.getElementById("hero-play-btn");
    if(heroPlay) heroPlay.href = link;
}

function renderLibraryGrid(list) {
    const container = document.getElementById("my-courses-grid");
    container.innerHTML = "";

    list.forEach(c => {
        const imgLink = c.imageUrl || "";
        const hasImg = imgLink.startsWith("http");
        // Lógica simples para imagem ou ícone padrão
        const cover = hasImg
            ? `<img src="${imgLink}" class="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition duration-500 scale-100 group-hover:scale-110">`
            : `<div class="w-full h-full bg-gray-800 flex items-center justify-center"><i class="fas fa-tooth text-gray-600 text-4xl"></i></div>`;

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
    const btn = document.getElementById("btn-logout");
    if(btn){
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.clear(); // Limpa tudo
            window.location.href="/auth/login.html";
        });
    }
}