// ==========================================
// ADMIN DASHBOARD (GRÁFICOS E KPIs)
// ==========================================

const API_URL = "http://localhost:8081";

document.addEventListener("DOMContentLoaded", () => {
    fetchDashboardStats();
    setupLogout();
});

function setupLogout() {
    const btn = document.getElementById("btn-logout");
    if(btn) {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "/auth/login.html";
        });
    }
}

async function fetchDashboardStats() {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/auth/login.html"; return; }

    try {
        // Busca Cursos e Usuários ao mesmo tempo
        const [coursesRes, usersRes] = await Promise.all([
            fetch(`${API_URL}/courses`, { headers: { "Authorization": `Bearer ${token}` } }),
            fetch(`${API_URL}/users`, { headers: { "Authorization": `Bearer ${token}` } })
        ]);

        if (coursesRes.status === 403 || usersRes.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/auth/login.html";
            return;
        }

        const courses = await coursesRes.json();
        let users = [];
        if(usersRes.ok) users = await usersRes.json();

        // --- CÁLCULOS (CORRIGIDO PARA ROLE: STUDENT) ---

        // 1. Conta quantos são ALUNOS (STUDENT)
        const totalStudents = users.filter(u => u.role === 'STUDENT').length;

        // 2. Conta quantos são ADMINS
        const totalAdmins = users.filter(u => u.role === 'ADMIN' || u.role === 'ROLE_ADMIN').length;

        // 3. Soma o valor dos cursos
        const totalCourses = courses.length;
        const totalValue = courses.reduce((acc, c) => acc + (parseFloat(c.price) || 0), 0);

        // Atualiza os Números na Tela
        animateValue("total-students", 0, totalStudents, 1000);
        animateValue("total-courses", 0, totalCourses, 1000);
        animateValue("total-admins", 0, totalAdmins, 1000);

        const elRev = document.getElementById("total-revenue");
        if(elRev) elRev.textContent = `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

        // Renderiza Tabela de Cursos e Gráficos
        renderCoursesTable(courses);
        renderCharts(totalStudents, totalAdmins, courses);

    } catch (e) {
        console.error("Erro ao carregar dashboard:", e);
    }
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if(!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function renderCoursesTable(courses) {
    const tbody = document.getElementById("courses-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!courses.length) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-gray-500 text-xs uppercase">Nenhum curso cadastrado.</td></tr>`;
        return;
    }

    courses.forEach(c => {
        tbody.innerHTML += `
            <tr class="border-b border-gray-800 hover:bg-white/5 transition-colors group">
                <td class="px-8 py-6 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 font-bold border border-yellow-500/30">
                            ${c.title.charAt(0)}
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-bold text-yellow-500">${c.title}</div>
                            <div class="text-[10px] text-green-500 uppercase font-bold mt-1">Ativo</div>
                        </div>
                    </div>
                </td>
                <td class="px-8 py-6 whitespace-nowrap text-sm text-gray-400">${c.category || 'Geral'}</td>
                <td class="px-8 py-6 whitespace-nowrap text-sm font-medium text-white">R$ ${(c.price || 0).toFixed(2)}</td>
                <td class="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                    <a href="/admin/gerenciar-aulas.html?id=${c.id}&title=${encodeURIComponent(c.title)}" 
                       class="text-gold hover:text-white mr-4 transition-colors inline-flex items-center gap-2 border border-gold/30 px-3 py-1 rounded hover:bg-gold hover:text-black" 
                       title="Adicionar Aulas">
                       <i class="fas fa-layer-group"></i> Aulas
                    </a>
                    <button onclick="deleteCourse(${c.id})" class="text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-colors">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
    });
}

function renderCharts(students, admins, courses) {
    const ctxUsers = document.getElementById('usersChart');
    if(ctxUsers) {
        if (Chart.getChart("usersChart")) Chart.getChart("usersChart").destroy();

        new Chart(ctxUsers, {
            type: 'doughnut',
            data: {
                labels: ['Alunos', 'Administradores'],
                datasets: [{
                    data: [students, admins], // Aqui ele usa o número de STUDENTs que calculamos lá em cima
                    backgroundColor: ['#D4AF37', '#333'],
                    borderColor: '#151515',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: 'rgba(255, 255, 255, 0.5)' } } },
                cutout: '70%'
            }
        });
    }

    const ctxRev = document.getElementById('revenueChart');
    if(ctxRev) {
        if (Chart.getChart("revenueChart")) Chart.getChart("revenueChart").destroy();
        const topCourses = [...courses].sort((a,b) => b.price - a.price).slice(0, 5);

        new Chart(ctxRev, {
            type: 'bar',
            data: {
                labels: topCourses.map(c => c.title.substring(0, 15) + '...'),
                datasets: [{
                    label: 'Preço (R$)',
                    data: topCourses.map(c => c.price),
                    backgroundColor: '#D4AF37',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255, 255, 255, 0.5)' } },
                    x: { grid: { display: false }, ticks: { color: 'rgba(255, 255, 255, 0.5)' } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
}

async function deleteCourse(id) {
    if (!confirm("Tem certeza que deseja excluir este curso permanentemente?")) return;
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API_URL}/courses/${id}`, {
            method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) { fetchDashboardStats(); } else { alert("Erro ao excluir."); }
    } catch (e) { alert("Erro de conexão."); }
}