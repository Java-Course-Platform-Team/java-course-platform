// js/admin.js - GESTÃO OPERACIONAL BLINDADA 🛡️

const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8081"
    : "https://odonto-backend-j9oy.onrender.com";

console.log(`Ambiente: ${window.location.hostname} | API: ${API_URL}`);

document.addEventListener("DOMContentLoaded", () => {
    checkAdminAuth();
    fetchDashboardStats();
    setupLogout();
});

function checkAdminAuth() {
    const userJson = localStorage.getItem("user");
    if (!userJson) {
        window.location.href = "/auth/login.html";
        return;
    }
    try {
        const user = JSON.parse(userJson);
        if (user.role !== "ADMIN") {
            alert("Acesso Negado.");
            window.location.href = "/aluno/area-aluno.html";
        }
    } catch(e) { window.location.href = "/auth/login.html"; }
}

async function fetchDashboardStats() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const [statsRes, coursesRes] = await Promise.all([
            fetch(`${API_URL}/admin/dashboard/stats`, {
                headers: { "Authorization": `Bearer ${token}` }
            }),
            fetch(`${API_URL}/courses`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
        ]);

        if (!statsRes.ok || !coursesRes.ok) throw new Error("Falha na comunicação com o banco.");

        const stats = await statsRes.json();
        const courses = await coursesRes.json();

        // --- ATUALIZAÇÃO DOS CARDS SUPERIORES ---
        animateValue("total-students", 0, stats.totalStudents || 0, 1000);
        animateValue("total-courses", 0, stats.totalCourses || 0, 1000);

        const adminLabel = document.querySelector("#total-admins")?.parentNode.querySelector("p");
        if(adminLabel) adminLabel.innerText = "MATRÍCULAS";
        animateValue("total-admins", 0, stats.totalEnrollments || 0, 1000);

        // --- ATUALIZAÇÃO DOS NÚMEROS AO LADO DO GRÁFICO (CORREÇÃO AQUI) ---
        // Usamos os novos IDs que inserimos no HTML para que o valor apareça lá também
        animateValue("chart-total-students", 0, stats.totalStudents || 0, 1000);
        animateValue("chart-total-enrolled", 0, stats.totalEnrollments || 0, 1000);

        const elRev = document.getElementById("total-revenue");
        if(elRev) {
            elRev.textContent = (stats.totalRevenue || 0).toLocaleString('pt-BR', {
                style: 'currency', currency: 'BRL'
            });
        }

        renderCoursesTable(courses);
        renderCharts(stats.totalStudents || 0, stats.totalEnrollments || 0);

    } catch (e) {
        console.error("Erro de sincronização:", e);
    }
}

function renderCoursesTable(courses) {
    const tbody = document.getElementById("courses-table-body");
    if (!tbody) return;

    if (courses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="py-10 text-center text-gray-500 italic">Nenhum curso cadastrado.</td></tr>`;
        return;
    }

    const recentCourses = courses.slice(0, 5);

    tbody.innerHTML = recentCourses.map(c => `
        <tr class="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
            <td class="px-8 py-6">
                <div class="text-sm font-bold text-white group-hover:text-gold transition-colors">${c.title}</div>
            </td>
            <td class="px-8 py-6 text-sm text-gray-400">${c.category || 'Geral'}</td>
            <td class="px-8 py-6 text-sm font-medium text-white">${parseFloat(c.price).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</td>
            <td class="px-8 py-6 text-right">
                <a href="/admin/gerenciar-aulas.html?id=${c.id}&title=${encodeURIComponent(c.title)}"
                   class="text-gray-500 hover:text-gold mr-3 transition-colors"
                   title="Gerenciar Módulos">
                    <i class="fas fa-layer-group"></i>
                </a>
            </td>
        </tr>`).join("");
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if(!obj) return;
    if(end === 0) { obj.innerText = "0"; return; }

    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString('pt-BR');
        if (progress < 1) window.requestAnimationFrame(step);
        else obj.innerHTML = end.toLocaleString('pt-BR');
    };
    window.requestAnimationFrame(step);
}

function renderCharts(students, enrollments) {
    const ctx = document.getElementById('usersChart');
    if(!ctx) return;

    const chartExist = Chart.getChart(ctx);
    if (chartExist) chartExist.destroy();

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Alunos', 'Matrículas'],
            datasets: [{
                data: [students, enrollments],
                backgroundColor: ['#D4AF37', '#1a1a1a'],
                borderColor: '#000',
                borderWidth: 2,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '80%',
            plugins: { legend: { display: false } }
        }
    });
}

function setupLogout() {
    const logoutBtns = document.querySelectorAll("#btn-logout, [onclick*='localStorage.clear()']");
    logoutBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "/auth/login.html";
        });
    });
}