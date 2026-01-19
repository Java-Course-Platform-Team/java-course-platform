const API_URL = "http://localhost:8081";
let allCourses = [];

document.addEventListener("DOMContentLoaded", () => {
    fetchCourses();
    setupSearch();
});

async function fetchCourses() {
    const token = localStorage.getItem("token");
    const container = document.getElementById("courses-admin-list");

    try {
        const res = await fetch(`${API_URL}/courses`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        allCourses = await res.json();
        renderCourses(allCourses);
    } catch (error) {
        container.innerHTML = `<p class="text-center py-10">Erro ao carregar cursos.</p>`;
    }
}

function renderCourses(courses) {
    const container = document.getElementById("courses-admin-list");
    container.innerHTML = "";

    courses.forEach(course => {
        const html = `
            <div class="bg-panel border border-white/5 p-4 flex items-center justify-between transition group">
                <div class="flex items-center gap-6">
                    <img src="${course.imageUrl || 'https://via.placeholder.com/150'}" class="w-16 h-16 object-cover border border-white/10">
                    <div>
                        <h3 class="text-white font-bold text-sm uppercase">${course.title}</h3>
                        <p class="text-xs text-gray-500">R$ ${parseFloat(course.price).toFixed(2)} - ${course.category || 'Geral'}</p>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button onclick="editCourse(${course.id})" class="p-2 text-gray-500 hover:text-gold transition">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteCourse(${course.id})" class="p-2 text-gray-500 hover:text-red-500 transition">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>`;
        container.insertAdjacentHTML('beforeend', html);
    });
}

function editCourse(id) {
    // Redireciona para form-curso.html conforme solicitado
    window.location.href = `/admin/form-curso.html?id=${id}`;
}

async function deleteCourse(id) {
    if (!confirm("Excluir curso?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/courses/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) fetchCourses();
}

function setupSearch() {
    const input = document.getElementById("search-courses");
    if(input) {
        input.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allCourses.filter(c => c.title.toLowerCase().includes(term));
            renderCourses(filtered);
        });
    }
}