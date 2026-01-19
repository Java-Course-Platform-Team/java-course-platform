const API_URL = "http://localhost:8081";
let globalCourses = [];
let ownedCourseIds = [];

document.addEventListener("DOMContentLoaded", () => {
    updateUserInfo();
    fetchInitialData();
    setupSearch();
    setupLogout();
});

async function fetchInitialData() {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/auth/login.html"; return; }

    try {
        const [catalogRes, enrollRes] = await Promise.all([
            fetch(`${API_URL}/courses`, { headers: { "Authorization": `Bearer ${token}` } }),
            fetch(`${API_URL}/enrollments/my-courses`, { headers: { "Authorization": `Bearer ${token}` } })
        ]);

        globalCourses = await catalogRes.json();
        if (enrollRes.ok) {
            const myCourses = await enrollRes.json();
            ownedCourseIds = myCourses.map(c => c.id);
        }
        renderCatalog(globalCourses);
    } catch (e) { console.error(e); }
}

function renderCatalog(list) {
    const container = document.getElementById("courses-grid");
    if (!container) return;
    container.innerHTML = "";

    list.forEach(c => {
        const iOwnIt = ownedCourseIds.includes(c.id);
        const btn = iOwnIt
            ? `<button disabled class="w-full py-3 bg-gray-800 text-gray-500 text-xs font-bold uppercase tracking-widest cursor-not-allowed">Já Adquirido</button>`
            : `<button onclick="startCheckout(${c.id})" class="w-full py-3 bg-gold hover:bg-yellow-500 text-black text-xs font-bold uppercase tracking-widest transition shadow-lg">Comprar - R$ ${c.price}</button>`;

        container.innerHTML += `
            <div class="bg-[#111] border border-white/5 hover:border-gold/30 transition flex flex-col h-full group">
                <div class="h-48 bg-neutral-900 relative overflow-hidden">
                    <img src="${c.imageUrl || ''}" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition">
                </div>
                <div class="p-6 flex flex-col flex-1">
                    <h3 class="text-lg font-serif text-white mb-2">${c.title}</h3>
                    <p class="text-gray-500 text-xs line-clamp-3 mb-6 flex-1">${c.description || ''}</p>
                    <div class="mt-auto">${btn}</div>
                </div>
            </div>`;
    });
}

async function startCheckout(courseId) {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

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
            alert("Erro ao gerar pagamento.");
        }
    } catch (e) { alert("Falha na conexão."); }
}

function updateUserInfo() {
    const name = localStorage.getItem("userName");
    const el = document.getElementById("user-name-display");
    if (el && name) el.textContent = name;
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
        const filtered = globalCourses.filter(c => c.title.toLowerCase().includes(term));
        renderCatalog(filtered);
    });
}