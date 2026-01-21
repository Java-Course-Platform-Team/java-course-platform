// student.js - Dashboard do Aluno
const API_URL = "http://localhost:8081";

document.addEventListener("DOMContentLoaded", () => {
    updateUserInfo();
    fetchMyLibrary();
});

function updateUserInfo() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const name = user.name || "Doutor";
    const firstName = name.split(" ")[0];

    const hour = new Date().getHours();
    let greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

    if(document.getElementById("user-greeting")) document.getElementById("user-greeting").textContent = greeting;
    if(document.getElementById("user-name-display")) document.getElementById("user-name-display").textContent = `Dr(a). ${firstName}`;
}

async function fetchMyLibrary() {
    const token = localStorage.getItem("token");
    const container = document.getElementById("my-courses-grid");
    if (!container || !token) return;

    try {
        const res = await fetch(`${API_URL}/enrollments/my-courses`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const courses = await res.json();

        if (courses.length === 0) {
            container.innerHTML = `<p class="col-span-full text-center text-gray-500 py-20 italic">Você ainda não possui cursos em sua biblioteca.</p>`;
            return;
        }

        container.innerHTML = courses.map(c => `
            <a href="/aluno/player.html?id=${c.id}&title=${encodeURIComponent(c.title)}" class="group relative bg-black border border-white/5 overflow-hidden">
                <div class="aspect-video bg-neutral-900">
                    <img src="${c.imageUrl || ''}" class="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition duration-700">
                </div>
                <div class="p-6">
                    <p class="text-gold text-[9px] uppercase tracking-widest mb-1">Elite Member</p>
                    <h3 class="text-white font-serif italic text-lg">${c.title}</h3>
                </div>
            </a>`).join("");
    } catch (e) { console.error("Erro na biblioteca"); }
}