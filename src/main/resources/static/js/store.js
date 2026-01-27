// store.js - VERSÃO QUE FUNCIONOU (COM TOASTIFY)
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8081"
    : "https://odonto-backend-j9oy.onrender.com";

let globalCourses = [];
let ownedCourseIds = [];

document.addEventListener("DOMContentLoaded", () => {
    updateUserInfo();
    fetchInitialData();
    setupSearch();
    setupLogout();
});

// 1. CARREGAMENTO DE DADOS
async function fetchInitialData() {
    const token = localStorage.getItem("token");
    // Se não tiver token, a loja abre, mas não sabe o que você comprou

    try {
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};

        // Busca Cursos (Público)
        const catalogReq = fetch(`${API_URL}/courses`);

        // Busca Minhas Compras (Só se tiver token)
        const enrollReq = token
            ? fetch(`${API_URL}/enrollments/my-courses`, { headers })
            : Promise.resolve(null);

        const [catalogRes, enrollRes] = await Promise.all([catalogReq, enrollReq]);

        if (catalogRes.ok) globalCourses = await catalogRes.json();

        if (enrollRes && enrollRes.ok) {
            const myCourses = await enrollRes.json();
            ownedCourseIds = myCourses.map(c => c.id);
        }

        renderCatalog(globalCourses);
    } catch (e) {
        console.error(e);
        showToast("Erro ao carregar catálogo.", "error");
    }
}

// 2. RENDERIZAÇÃO
function renderCatalog(list) {
    const container = document.getElementById("courses-grid");
    if (!container) return;
    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = `<p class="text-gray-500 italic text-center col-span-full py-20">Nenhum curso disponível no momento.</p>`;
        return;
    }

    list.forEach(c => {
        const iOwnIt = ownedCourseIds.includes(c.id);

        const priceFormatted = parseFloat(c.price || 0).toLocaleString('pt-BR', {
            style: 'currency', currency: 'BRL'
        });

        // Lógica do Botão: Já tem vs Comprar
        const btnAction = iOwnIt
            ? `<button disabled class="w-full py-4 bg-white/5 text-green-500 text-[10px] font-bold uppercase tracking-[0.3em] cursor-not-allowed border border-white/5"><i class="fas fa-check"></i> JÁ ADQUIRIDO</button>`
            : `<button onclick="startCheckout(this, '${c.id}')" class="w-full py-4 bg-gold hover:bg-yellow-500 text-black text-[10px] font-bold uppercase tracking-[0.3em] transition-all shadow-[0_10px_30px_rgba(212,175,55,0.1)]">ADQUIRIR ACESSO</button>`;

        container.innerHTML += `
            <div class="bg-dark-800 border border-white/10 hover:border-gold/30 transition-all duration-500 flex flex-col h-full group rounded-xl overflow-hidden">
                <div class="h-64 bg-neutral-900 relative overflow-hidden">
                    <img src="${c.imageUrl || 'https://images.unsplash.com/photo-1628177142898-93e48732b86a?q=80&w=1000'}"
                         class="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000">
                    <div class="absolute top-0 right-0 bg-gold text-black text-xs font-bold px-3 py-1 uppercase tracking-widest">${priceFormatted}</div>
                </div>
                <div class="p-6 flex flex-col flex-1">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-gold text-[9px] uppercase tracking-[0.4em]">Elite</span>
                    </div>
                    <h3 class="text-xl font-serif text-white mb-3 italic">${c.title}</h3>
                    <p class="text-gray-500 text-xs line-clamp-3 mb-8 leading-relaxed">${c.description || 'Conteúdo exclusivo.'}</p>
                    <div class="mt-auto">${btnAction}</div>
                </div>
            </div>`;
    });
}

// 3. CHECKOUT (O SEGREDO ESTÁ AQUI)
async function startCheckout(btn, courseId) {
    const token = localStorage.getItem("token");
    // Tenta pegar o user salvo. Se não tiver, cria um objeto vazio para não quebrar
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token) {
        showToast("Faça login para comprar.", "error");
        setTimeout(() => window.location.href = "/auth/login.html", 1500);
        return;
    }

    // Se seu Backend exige o ID do usuário no JSON, ele precisa estar salvo no localStorage
    if (!user.id) {
        console.warn("User ID não encontrado no localStorage. Tentando enviar apenas token...");
        // Se der erro aqui, é porque precisamos ajustar o Login para salvar o user.id
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
    btn.disabled = true;

    try {
        // AQUI ESTÁ A MÁGICA QUE FEZ FUNCIONAR:
        // Mandamos um POST para /checkout (sem ID na URL)
        // E mandamos um JSON com { userId, courseId }
        const response = await fetch(`${API_URL}/payments/checkout`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: user.id, // O Backend antigo espera isso
                courseId: courseId
            })
        });

        const data = await response.json();

        if (data.url || data.init_point) {
            window.location.href = data.url || data.init_point;
        } else {
            throw new Error("Link não recebido");
        }
    } catch (e) {
        console.error(e);
        showToast("Erro ao iniciar pagamento.", "error");
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function updateUserInfo() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const el = document.getElementById("user-name-display");
    if (el && user.name) el.textContent = user.name;
}

function setupLogout() {
    document.getElementById("btn-logout")?.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "/auth/login.html";
    });
}

function setupSearch() {
    document.getElementById("search-input")?.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase();
        renderCatalog(globalCourses.filter(c => c.title.toLowerCase().includes(term)));
    });
}

function showToast(msg, type = "success") {
    if (typeof Toastify === 'function') {
        Toastify({
            text: msg, duration: 3000,
            style: { background: type === "error" ? "#ef4444" : "#D4AF37", color: type === "error" ? "#fff" : "#000" }
        }).showToast();
    } else {
        alert(msg);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btnOpen = document.getElementById('mobile-menu-btn');
    const btnClose = document.getElementById('close-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('menu-overlay');

    function toggleMenu() {
        const isOpen = !menu.classList.contains('translate-x-full');

        if (isOpen) {
            menu.classList.add('translate-x-full');
            overlay.classList.add('hidden');
            document.body.style.overflow = ''; // Habilita scroll
        } else {
            menu.classList.remove('translate-x-full');
            overlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Trava scroll do fundo
        }
    }

    btnOpen.addEventListener('click', toggleMenu);
    btnClose.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu); // Fecha ao clicar fora
});