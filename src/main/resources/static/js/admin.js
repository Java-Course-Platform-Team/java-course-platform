// admin.js - GESTÃO OPERACIONAL REAL
const API_URL = "http://localhost:8081";

document.addEventListener("DOMContentLoaded", () => {
    fetchDashboardStats();
    setupLogout();
});

async function fetchDashboardStats() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/auth/login.html";
        return;
    }

    try {
        // Chamadas simultâneas para otimizar o carregamento real
        const [statsRes, coursesRes] = await Promise.all([
            fetch(`${API_URL}/stats`, {
                headers: { "Authorization": `Bearer ${token}` }
            }),
            fetch(`${API_URL}/courses`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
        ]);

        if (!statsRes.ok || !coursesRes.ok) throw new Error("Falha na comunicação com o banco.");

        const stats = await statsRes.json();
        const courses = await coursesRes.json();

        // Mapeamento exato com o DashboardStatsDTO do Felipe
        animateValue("total-students", 0, stats.students || 0, 1000);
        animateValue("total-courses", 0, stats.courses || 0, 1000);
        animateValue("total-admins", 0, stats.admins || 0, 1000);

        const elRev = document.getElementById("total-revenue");
        if(elRev) {
            elRev.textContent = `R$ ${(stats.revenue || 0).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        }

        renderCoursesTable(courses);
        renderCharts(stats.students || 0, stats.admins || 0);

    } catch (e) {
        console.error("Erro de sincronização:", e);
        if (typeof UI !== 'undefined') {
            UI.toast.error("Servidor 8081 inacessível ou sessão expirada.");
        }
    }
}

function renderCoursesTable(courses) {
    const tbody = document.getElementById("courses-table-body");
    if (!tbody) return;

    if (courses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="py-10 text-center text-gray-500 italic">Nenhum curso cadastrado no banco de dados.</td></tr>`;
        return;
    }

    tbody.innerHTML = courses.map(c => `
        <tr class="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
            <td class="px-8 py-6">
                <div class="text-sm font-bold text-white group-hover:text-gold transition-colors">${c.title}</div>
            </td>
            <td class="px-8 py-6 text-sm text-gray-400">Odontologia</td>
            <td class="px-8 py-6 text-sm font-medium text-white">R$ ${parseFloat(c.price).toFixed(2)}</td>
            <td class="px-8 py-6 text-right">
                <a href="/admin/gerenciar-aulas.html?id=${c.id}&title=${encodeURIComponent(c.title)}"
                   class="text-gray-500 hover:text-gold mr-3 transition-colors"
                   title="Gerenciar Módulos e Aulas">
                    <i class="fas fa-layer-group"></i>
                </a>
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
        obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString('pt-BR');
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

function renderCharts(students, admins) {
    const ctx = document.getElementById('usersChart');
    if(!ctx) return;

    // Destrói gráfico anterior se existir para evitar bugs de hover
    const chartExist = Chart.getChart(ctx);
    if (chartExist) chartExist.destroy();

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Alunos', 'Administradores'],
            datasets: [{
                data: [students, admins],
                backgroundColor: ['#D4AF37', '#1a1a1a'],
                borderColor: '#000',
                borderWidth: 4,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '82%',
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function setupLogout() {
    document.getElementById("btn-logout")?.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "/auth/login.html";
    });
}