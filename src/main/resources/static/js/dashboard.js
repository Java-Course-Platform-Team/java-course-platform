// ==========================================
// STORE (LOJA DE CURSOS) - VERSÃO FINAL (REAL)
// ==========================================

const API_URL = "http://localhost:8081";
let globalCourses = [];

document.addEventListener("DOMContentLoaded", () => {
    // 1. Mostra Skeletons (Carregamento)
    renderSkeletons();

    // 2. Busca dados reais
    setTimeout(() => {
        fetchStudentCourses();
    }, 500);

    updateUserInfo();
    setupSearch();
    setupLogout();
});

function updateUserInfo() {
    const userName = localStorage.getItem("userName");
    const nameElement = document.getElementById("user-name-display");
    if (nameElement && userName) {
        nameElement.textContent = userName;
    }
}

// --- CHECKOUT REAL (INTEGRADO AO BACKEND) ---
async function startCheckout(courseId, courseTitle, price) {
    const token = localStorage.getItem("token");

    // 1. Verifica se está logado
    if (!token) {
        alert("Você precisa estar logado para comprar.");
        window.location.href = "/auth/login.html";
        return;
    }

    // 2. Tenta pegar o ID do usuário (Salvo no login)
    // Se o John não estiver salvando o objeto 'user' inteiro, isso pode ser null.
    // Nesse caso, o Backend teria que pegar o ID pelo Token (mas vamos tentar mandar o JSON conforme combinado).
    const userJson = localStorage.getItem("user");
    let userId = null;
    if (userJson) {
        try {
            const userObj = JSON.parse(userJson);
            userId = userObj.id;
        } catch (e) { console.error("Erro ao ler usuário", e); }
    }

    // 3. Feedback Visual (Botão muda de estado)
    if (typeof UI !== 'undefined') UI.toast.info("Conectando ao Mercado Pago...");

    // Procura o botão que foi clicado para desativar
    const btn = event.target.closest('button');
    if(btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Aguarde...';
        btn.disabled = true;
    }

    try {
        // 4. CHAMA O BACKEND REAL 🚀
        const response = await fetch(`${API_URL}/payments/checkout`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: userId, // Se for null, o Backend pega do Token
                courseId: courseId
            })
        });

        if (!response.ok) {
            throw new Error("Erro ao gerar link de pagamento");
        }

        const data = await response.json();

        // 5. REDIRECIONA PRO MERCADO PAGO
        if (data.url) {
            console.log("Link gerado com sucesso:", data.url);
            window.location.href = data.url;
        } else {
            alert("Erro: O servidor não retornou o link de pagamento.");
        }

    } catch (error) {
        console.error(error);
        alert("Não foi possível iniciar o pagamento. Tente novamente.");
        if(btn) {
            btn.innerHTML = 'COMPRAR';
            btn.disabled = false;
        }
    }
}

function renderSkeletons() {
    const container = document.getElementById("courses-grid");
    if (!container) return;
    container.innerHTML = "";

    // Skeleton visual simples
    const skeletonCard = `
        <div class="bg-[#111] border border-gray-800 flex flex-col h-full rounded-sm overflow-hidden opacity-50">
            <div class="h-52 w-full bg-gray-800 animate-pulse"></div>
            <div class="p-8 space-y-4">
                <div class="h-6 w-3/4 bg-gray-800 animate-pulse rounded"></div>
                <div class="h-4 w-1/2 bg-gray-800 animate-pulse rounded"></div>
            </div>
        </div>`;
    container.innerHTML = skeletonCard.repeat(3);
}

function setupLogout() {
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "/auth/login.html";
        });
    }
}

function setupSearch() {
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const termo = e.target.value.toLowerCase();
            const cursosFiltrados = globalCourses.filter(course =>
                course.title.toLowerCase().includes(termo) ||
                (course.category && course.category.toLowerCase().includes(termo))
            );
            renderCourses(cursosFiltrados);
        });
    }
}

async function fetchStudentCourses() {
    const container = document.getElementById("courses-grid");
    if (!container) return;

    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/auth/login.html"; return; }

    try {
        const response = await fetch(`${API_URL}/courses`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.status === 403 || response.status === 401) {
            localStorage.clear();
            window.location.href = "/auth/login.html";
            return;
        }

        globalCourses = await response.json();
        renderCourses(globalCourses);

    } catch (error) {
        console.error("Erro:", error);
        container.innerHTML = '<p class="text-red-500 col-span-full text-center">Erro de conexão com o servidor.</p>';
    }
}

function renderCourses(coursesList) {
    const container = document.getElementById("courses-grid");
    container.innerHTML = "";

    if (!Array.isArray(coursesList) || coursesList.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-20 bg-white/5 rounded-lg border border-white/10 animate-fade-in">
                <i class="fas fa-search text-gray-600 text-4xl mb-4"></i>
                <p class="text-yellow-500 uppercase tracking-widest text-sm">Nenhum curso encontrado</p>
            </div>`;
        return;
    }

    coursesList.forEach(course => {
        const price = course.price ? parseFloat(course.price) : 0.00;
        const playerLink = `/aluno/player.html?id=${course.id}&title=${encodeURIComponent(course.title)}`;

        // Se o Backend mandar um campo 'purchased: true', mudamos o botão para "Assistir"
        // Por enquanto, assumimos que na Loja o foco é vender.
        const actionButton = `<button onclick="startCheckout(${course.id}, '${course.title.replace(/'/g, "\\'")}', ${price})" class="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(212,175,55,0.4)] rounded-sm">
                Comprar
              </button>`;

        const imgLink = course.imageUrl || "";
        const hasValidImage = imgLink && imgLink.startsWith("http");

        const coverContent = hasValidImage
            ? `<img src="${imgLink}" alt="${course.title}" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 grayscale group-hover:grayscale-0">`
            : `<div class="absolute inset-0 opacity-20 bg-gray-800"></div><i class="fas fa-tooth absolute -bottom-8 -left-8 text-9xl text-yellow-500 opacity-5 group-hover:opacity-10 transition duration-700"></i>`;

        const card = `
            <div class="bg-[#111] border border-gray-800 hover:border-yellow-500/50 flex flex-col h-full transition-all duration-300 group relative hover:-translate-y-2 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,1)] animate-fade-in">
                <div class="h-52 bg-neutral-900 relative overflow-hidden shrink-0 border-b border-white/5">
                    ${coverContent}
                    <span class="absolute top-4 right-4 bg-black/80 backdrop-blur-sm border border-yellow-500/50 text-yellow-500 text-[10px] font-bold px-3 py-1 uppercase tracking-widest z-10 shadow-lg">
                        ${course.category || 'Odonto'}
                    </span>
                </div>
                <div class="p-8 flex flex-col flex-1 relative">
                    <h3 class="text-xl font-serif text-yellow-500 mb-3 leading-tight line-clamp-2 cursor-default" title="${course.title}">
                        ${course.title}
                    </h3>
                    <div class="w-12 h-0.5 bg-yellow-500/50 mb-4"></div>
                    <p class="text-gray-400 text-sm font-light leading-relaxed mb-8 flex-1 line-clamp-3">
                       ${course.description || 'Domine as técnicas mais avançadas.'}
                    </p>
                    <div class="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
                        <div>
                            <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Investimento</p>
                            <p class="text-2xl font-serif text-white group-hover:text-yellow-500 transition-colors">
                                R$ ${price.toFixed(2)}
                            </p>
                        </div>
                        <div>${actionButton}</div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}