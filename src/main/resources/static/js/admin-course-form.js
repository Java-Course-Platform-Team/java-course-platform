// admin-course-form.js - Criação e Edição de Cursos
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8081"
    : "https://odonto-backend-j9oy.onrender.com";

const token = localStorage.getItem("token");
const urlParams = new URLSearchParams(window.location.search);
const editId = urlParams.get('edit'); // Se tiver ID, é edição. Se não, é criação.

document.addEventListener("DOMContentLoaded", () => {
    if (!token) { window.location.href = "/auth/login.html"; return; }

    if (editId) {
        prepareEditMode();
    }

    setupFormSubmission();
});

// 1. PREPARA O FORMULÁRIO PARA EDIÇÃO (Busca dados antigos)
async function prepareEditMode() {
    const pageTitle = document.getElementById("page-title");
    if (pageTitle) pageTitle.textContent = "Editar Curso";

    try {
        const response = await fetch(`${API_URL}/courses/${editId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
            window.location.href = "/auth/login.html";
            return;
        }

        if (response.ok) {
            const course = await response.json();
            // Preenche os inputs (garante que os IDs no HTML estejam corretos)
            if(document.getElementById("title")) document.getElementById("title").value = course.title || "";
            if(document.getElementById("slug")) document.getElementById("slug").value = course.slug || "";
            if(document.getElementById("price")) document.getElementById("price").value = course.price || "";
            if(document.getElementById("category")) document.getElementById("category").value = course.category || "";
            if(document.getElementById("imageUrl")) document.getElementById("imageUrl").value = course.imageUrl || "";
            if(document.getElementById("description")) document.getElementById("description").value = course.description || "";
        }
    } catch (error) {
        console.error("Erro ao carregar curso:", error);
    }
}

// 2. ENVIO DO FORMULÁRIO (Salvar)
function setupFormSubmission() {
    const form = document.getElementById("course-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector("button[type='submit']");
        const originalText = submitBtn.innerHTML;

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

        const courseData = {
            title: document.getElementById("title").value.trim(),
            slug: document.getElementById("slug").value.trim(),
            price: parseFloat(document.getElementById("price").value),
            category: document.getElementById("category").value.trim(),
            imageUrl: document.getElementById("imageUrl").value.trim(),
            description: document.getElementById("description").value.trim()
        };

        // Decide se é POST (Novo) ou PUT (Atualizar)
        const method = editId ? "PUT" : "POST";
        const url = editId ? `${API_URL}/courses/${editId}` : `${API_URL}/courses`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(courseData)
            });

            if (response.ok) {
                if (typeof Toastify !== 'undefined') {
                    Toastify({
                        text: editId ? "Curso atualizado!" : "Curso criado!",
                        duration: 2000,
                        style: { background: "#D4AF37", color: "#000" }
                    }).showToast();
                } else {
                    alert("Sucesso!");
                }

                setTimeout(() => {
                    window.location.href = "gerenciar-cursos.html";
                }, 1500);
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert(errorData.message || "Erro ao salvar curso.");
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}