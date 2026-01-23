// admin-course-form.js - Integração Real com o Backend OdontoPro
//  CONFIGURAÇÃO AUTOMÁTICA DE AMBIENTE
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8081"                  // Se estou no PC, uso IntelliJ Local
    : "https://odonto-backend-j9oy.onrender.com"; // Se estou na Web, uso a Nuvem
const token = localStorage.getItem("token");

// Identifica se estamos em modo de edição
const urlParams = new URLSearchParams(window.location.search);
const editId = urlParams.get('edit');

document.addEventListener("DOMContentLoaded", () => {
    if (!token) {
        window.location.href = "/auth/login.html";
        return;
    }

    if (editId) {
        prepareEditMode();
    }

    setupFormSubmission();
});

// 1. PREPARA O FORMULÁRIO PARA EDIÇÃO
async function prepareEditMode() {
    // Altera o título visual da página
    const pageTitle = document.getElementById("page-title");
    const subTitle = pageTitle.nextElementSibling;
    if (pageTitle) pageTitle.textContent = "Editar Curso";
    if (subTitle) subTitle.textContent = "Atualizar Informações no Catálogo";

    try {
        const response = await fetch(`${API_URL}/courses/${editId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            const course = await response.json();
            // Preenche os campos do formulário com os dados do banco
            document.getElementById("title").value = course.title || "";
            document.getElementById("slug").value = course.slug || "";
            document.getElementById("price").value = course.price || "";
            document.getElementById("category").value = course.category || "";
            document.getElementById("imageUrl").value = course.imageUrl || "";
            document.getElementById("description").value = course.description || "";
        }
    } catch (error) {
        console.error("Erro ao carregar dados do curso para edição.");
    }
}

// 2. GESTÃO DO ENVIO DO FORMULÁRIO
function setupFormSubmission() {
    const form = document.getElementById("course-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector("button[type='submit']");
        const originalBtnText = submitBtn.innerHTML;
        
        // Feedback visual de carregamento
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processando...';

        // Coleta os dados seguindo a entidade Course.java
        const courseData = {
            title: document.getElementById("title").value.trim(),
            slug: document.getElementById("slug").value.trim(),
            price: parseFloat(document.getElementById("price").value),
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
                // Notificação de sucesso usando a biblioteca Toastify
                if (typeof Toastify !== 'undefined') {
                    Toastify({
                        text: editId ? "Curso atualizado com sucesso!" : "Novo curso publicado!",
                        duration: 3000,
                        gravity: "top",
                        position: "right",
                        style: { background: "#D4AF37", color: "#000" }
                    }).showToast();
                }
                
                // Redireciona após um curto intervalo
                setTimeout(() => {
                    window.location.href = "gerenciar-cursos.html";
                }, 1500);
            } else {
                throw new Error("Erro na resposta do servidor");
            }
        } catch (error) {
            alert("Ocorreu um erro ao salvar o curso. Verifique a conexão com o servidor.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}