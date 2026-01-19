const API_URL = "http://localhost:8081";

document.addEventListener("DOMContentLoaded", () => {
    fetchDashboardStats();
    setupLogout();
});

async function fetchDashboardStats() {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/auth/login.html"; return; }

    try {
        const [statsRes, coursesRes] = await Promise.all([
            fetch(`${API_URL}/stats`, { headers: { "Authorization": `Bearer ${token}` } }),
            fetch(`${API_URL}/courses`, { headers: { "Authorization": `Bearer ${token}` } })
        ]);

        const stats = await statsRes.json();
        const courses = await coursesRes.json();

        animateValue("total-students", 0, stats.totalStudents || 0, 1000);
        animateValue("total-courses", 0, stats.totalCourses || 0, 1000);
        animateValue("total-admins", 0, stats.totalAdmins || 0, 1000);

        const elRev = document.getElementById("total-revenue");
        if(elRev) elRev.textContent = `R$ ${(stats.revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

        renderCoursesTable(courses);
        renderCharts(stats.totalStudents, stats.totalAdmins);
    } catch (e) { console.error(e); }
}

function renderCoursesTable(courses) {
    const tbody = document.getElementById("courses-table-body");
    if (!tbody) return;
    tbody.innerHTML = courses.map(c => `
        <tr class="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
            <td class="px-8 py-6">
                <div class="text-sm font-bold text-white group-hover:text-gold transition-colors">${c.title}</div>
            </td>
            <td class="px-8 py-6 text-sm text-gray-400">${c.category || 'Geral'}</td>
            <td class="px-8 py-6 text-sm font-medium text-white">R$ ${parseFloat(c.price).toFixed(2)}</td>
            <td class="px-8 py-6 text-right">
                <a href="/admin/gerenciar-aulas.html?id=${c.id}" class="text-gray-500 hover:text-gold mr-3"><i class="fas fa-layer-group"></i></a>
            </td>
        </tr>`).join("");
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if(!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

function renderCharts(students, admins) {
    const ctx = document.getElementById('usersChart');
    if(!ctx) return;
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Alunos', 'Admins'],
            datasets: [{ data: [students, admins], backgroundColor: ['#D4AF37', '#333'], borderColor: '#151515', borderWidth: 2 }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '75%' }
    });
}

function setupLogout() {
    document.getElementById("btn-logout")?.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "/auth/login.html";
    });
}