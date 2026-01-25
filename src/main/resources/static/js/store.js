// store.js - LOJA E MATRÍCULAS
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8081"
    : "https://odonto-backend-j9oy.onrender.com";

let globalCourses = [];
let ownedCourseIds = [];

document.addEventListener("DOMContentLoaded", () => {
    fetchInitialData();
    setupSearch();
});

async function fetchInitialData() {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/auth/login.html"; return; }

    try {
        const [catalogRes, enrollRes] = await Promise.all([
            fetch(`${API_URL}/courses`, { headers: { "Authorization": `Bearer ${token}` } }),
            fetch(`${API_URL}/enrollments/my-courses`, { headers: { "Authorization": `Bearer ${token}` } })
        ]);

        if (catalogRes.status === 401 || enrollRes.status === 401) {
            localStorage.clear();
            window.location.href = "/auth/login.html";
            return;
        }

        if (catalogRes.ok) globalCourses = await catalogRes.json();
        if (enrollRes.ok) {
            const myCourses = await enrollRes.json();
            ownedCourseIds = myCourses.map(c => c.id);
        }

        renderCatalog(globalCourses);
    } catch (e) {
        showToast("Erro ao carregar catálogo.", "error");
    }
}

function renderCatalog(list) {
    const container = document.getElementById("courses-grid");
    if (!container) return;
    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = `<p class="text-gray-500 italic text-center col-span-full py-20">Nenhum curso disponível.</p>`;
        return;
    }

    list.forEach(c => {
        const iOwnIt = ownedCourseIds.includes(c.id);
        const priceFormatted = parseFloat(c.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        const btnAction = iOwnIt
            ? `<button disabled class="w-full py-4 bg-white/5 text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em] cursor-not-allowed border border-white/5">Já Adquirido</button>`
            : `<button onclick="startCheckout(this, '${c.id}')" class="w-full py-4 bg-gold hover:bg-gold-light text-black text-[10px] font-bold uppercase tracking-[0.3em] transition-all shadow-[0_10px_30px_rgba(212,175,55,0.1)]">Adquirir Acesso</button>`;

        container.innerHTML += `
            <div class="bg-black border border-white/5 hover:border-gold/30 transition-all duration-500 flex flex-col h-full group">
                <div class="h-64 bg-neutral-900 relative overflow-hidden">
                    <img src="${c.imageUrl || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09'}"
                         class="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000">
                </div>
                <div class="p-8 flex flex-col flex-1">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-gold text-[9px] uppercase tracking-[0.4em]">Elite</span>
                        <span class="text-white font-serif italic text-sm">${priceFormatted}</span>
                    </div>
                    <h3 class="text-xl font-serif text-white mb-3 italic">${c.title}</h3>
                    <p class="text-gray-500 text-xs line-clamp-3 mb-8 leading-relaxed">${c.description || 'Conteúdo exclusivo.'}</p>
                    <div class="mt-auto">${btnAction}</div>
                </div>
            </div>`;
    });
}

// Attach to window to ensure it works with onclick
window.startCheckout = async function(btn, courseId) {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!user.id) {
        showToast("Erro de sessão. Faça login novamente.", "error");
        setTimeout(() => window.location.href = "/auth/login.html", 1500);
        return;
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/payments/checkout`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, courseId: courseId })
        });

        const data = await response.json();
        if (data.url || data.init_point) {
            window.location.href = data.url || data.init_point;
        } else {
            throw new Error("Link não gerado");
        }
    } catch (e) {
        showToast("Falha ao iniciar pagamento.", "error");
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
};

function setupSearch() {
    document.getElementById("search-input")?.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = globalCourses.filter(c => c.title.toLowerCase().includes(term));
        renderCatalog(filtered);
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