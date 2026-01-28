// admin-course-form.js - Versão Profissional Corrigida
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8081"
    : "https://odonto-backend-j9oy.onrender.com";

const token = localStorage.getItem("token");
const urlParams = new URLSearchParams(window.location.search);
const editId = urlParams.get('edit');

document.addEventListener("DOMContentLoaded", () => {
    // CORREÇÃO: Verificação de token robusta
    if (!token || token === "undefined") {
        window.location.replace("/auth/login.html");
        return;
    }

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
            localStorage.clear();
            window.location.href = "/auth/login.html";
            return;
        }

        if (response.ok) {
            const course = await response.json();
            // MANTIDO: Preenchimento seguro com verificação de existência
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

        // CORREÇÃO: Conversão segura de preço para evitar erro de backend (NaN)
        const priceValue = document.getElementById("price").value;
        const courseData = {
            title: document.getElementById("title").value.trim(),
            slug: document.getElementById("slug").value.trim(),
            price: parseFloat(priceValue) || 0.0,
            category: document.getElementById("category").value.trim(),
            imageUrl: document.getElementById("imageUrl").value.trim(),
            description: document.getElementById("description").value.trim()
        };

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
                        text: editId ? "Curso atualizado com sucesso!" : "Curso criado com sucesso!",
                        duration: 2000,
                        style: { background: "#D4AF37", color: "#000" }
                    }).showToast();
                } else {
                    alert(editId ? "Curso atualizado!" : "Curso criado!");
                }

                setTimeout(() => {
                    // CORREÇÃO: Redirecionamento limpo
                    window.location.href = "gerenciar-cursos.html";
                }, 1500);
            } else {
                // CORREÇÃO: Captura detalhada de erro do backend Java
                const errorData = await response.json().catch(() => ({}));
                alert(errorData.message || "Erro ao salvar curso. Verifique se o Slug já existe.");
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão com o servidor.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}