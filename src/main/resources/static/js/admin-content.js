// admin-content.js - Persistência Real no Banco
//  CONFIGURAÇÃO AUTOMÁTICA DE AMBIENTE
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8081"                  // Se estou no PC, uso IntelliJ Local
    : "https://odonto-backend-j9oy.onrender.com"; // Se estou na Web, uso a Nuvem
const token = localStorage.getItem("token");
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('id');

document.addEventListener("DOMContentLoaded", () => {
    if (!courseId) { window.location.href = "gerenciar-cursos.html"; return; }
    loadContentFromBackend();
});

async function loadContentFromBackend() {
    try {
        const res = await fetch(`${API_URL}/courses/${courseId}/modules`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const modules = await res.json();
        renderModules(modules);
    } catch (e) { UI.toast.error("Erro ao sincronizar com o banco."); }
}

async function addModule() {
    const title = prompt("Título do Módulo:");
    if (!title) return;

    try {
        const res = await fetch(`${API_URL}/courses/modules`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            // CORREÇÃO AQUI: Removido parseInt() pois courseId agora é UUID (String)
            body: JSON.stringify({ title, courseId: courseId })
        });
        if (res.ok) {
            UI.toast.success("Módulo salvo!");
            loadContentFromBackend();
        }
    } catch (e) { UI.toast.error("Erro na gravação."); }
}

async function saveLesson(moduleId, lessonData) {
    try {
        const res = await fetch(`${API_URL}/courses/lessons`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ ...lessonData, moduleId })
        });
        if (res.ok) {
            UI.toast.success("Aula publicada!");
            loadContentFromBackend();
        }
    } catch (e) { UI.toast.error("Erro ao publicar aula."); }
}