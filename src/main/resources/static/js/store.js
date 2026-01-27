// js/store.js - LOJA E MATRÍCULAS (CORRIGIDO)
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8081"
    : "https://odonto-backend-j9oy.onrender.com";

let globalCourses = [];
let ownedCourseIds = [];

const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {
    // A loja pode ser vista sem login? Geralmente sim, mas para saber se "Já comprei", precisa do token.
    fetchInitialData();
    setupSearch();
});

async function fetchInitialData() {
    try {
        // 1. Busca o catálogo (Público)
        const catalogRes = await fetch(`${API_URL}/courses`);

        // 2. Se tiver logado, busca quais eu já tenho
        let enrollRes = null;
        if (token) {
            enrollRes = await fetch(`${API_URL}/api/enrollments/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
        }

        if (catalogRes.ok) {
            globalCourses = await catalogRes.json();
        }

        if (enrollRes && enrollRes.ok) {
            const myEnrollments = await enrollRes.json();
            // O endpoint /me retorna Enrollments, precisamos extrair os IDs dos cursos dentro deles
            ownedCourseIds = myEnrollments.map(item => {
                // Se o objeto for Enrollment { course: { id: ... } }
                if (item.course && item.course.id) return item.course.id;
                // Se for direto o curso (depende do backend)
                return item.id;
            });
        }

        renderCatalog(globalCourses);

    } catch (e) {
        console.error(e);
        showToast("Erro ao carregar catálogo.", "error");
        document.getElementById("courses-grid").innerHTML = `<p class="text-center text-gray-500 col-span-full">Erro de conexão.</p>`;
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
        const img = c.imageUrl || 'https://images.unsplash.com/photo-1628177142898-93e48732b86a?q=80&w=1000';

        // Botão Muda se você já tem o curso
        const btnAction = iOwnIt
            ? `<button disabled class="w-full py-4 bg-white/5 text-green-500 text-[10px] font-bold uppercase tracking-[0.3em] cursor-not-allowed border border-white/5"><i class="fas fa-check"></i> Já Adquirido</button>`
            : `<button onclick="startCheckout(this, '${c.id}')" class="w-full py-4 bg-gold hover:bg-yellow-500 text-black text-[10px] font-bold uppercase tracking-[0.3em] transition-all shadow-[0_10px_30px_rgba(212,175,55,0.1)]">Adquirir Acesso</button>`;

        container.innerHTML += `
            <div class="bg-dark-800 border border-white/10 hover:border-gold/30 transition-all duration-500 flex flex-col h-full group rounded-xl overflow-hidden">
                <div class="h-56 bg-neutral-900 relative overflow-hidden">
                    <img src="${img}" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000">
                    <div class="absolute top-0 right-0 bg-gold text-black text-xs font-bold px-3 py-1 uppercase tracking-widest">${priceFormatted}</div>
                </div>
                <div class="p-6 flex flex-col flex-1">
                    <span class="text-gold/70 text-[9px] uppercase tracking-[0.2em] mb-2">${c.category || 'CURSO'}</span>
                    <h3 class="text-xl font-serif text-white mb-3 leading-tight">${c.title}</h3>
                    <p class="text-gray-500 text-xs line-clamp-3 mb-8 leading-relaxed font-light">${c.description || 'Conteúdo exclusivo de alta performance.'}</p>
                    <div class="mt-auto">${btnAction}</div>
                </div>
            </div>`;
    });
}

// Função de Checkout (Corrigida para usar Token)
window.startCheckout = async function(btn, courseId) {
    if (!token) {
        showToast("Faça login para comprar.", "error");
        setTimeout(() => window.location.href = "/auth/login.html", 1500);
        return;
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
    btn.disabled = true;

    try {
        // CORREÇÃO: Usa a URL com o ID do curso e envia o Token no Header
        const response = await fetch(`${API_URL}/api/payments/checkout/${courseId}`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            const paymentUrl = await response.text(); // O Java retorna a URL como texto
            window.location.href = paymentUrl; // Redireciona para o Mercado Pago
        } else {
            throw new Error("Erro ao gerar link");
        }
    } catch (e) {
        console.error(e);
        showToast("Falha ao iniciar pagamento.", "error");
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
};

function setupSearch() {
    const input = document.getElementById("search-input");
    if(input) {
        input.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = globalCourses.filter(c => c.title.toLowerCase().includes(term));
            renderCatalog(filtered);
        });
    }
}

function showToast(msg, type = "success") {
    if (typeof Toastify === 'function') {
        Toastify({
            text: msg, duration: 3000, gravity: "top", position: "right",
            style: { background: type === "error" ? "#ef4444" : "#D4AF37", color: type === "error" ? "#fff" : "#000" }
        }).showToast();
    } else {
        alert(msg);
    }
}