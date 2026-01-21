// admin-content.js - Persistência Real no Banco
const API_URL = "http://localhost:8081";
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
            body: JSON.stringify({ title, courseId: parseInt(courseId) })
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