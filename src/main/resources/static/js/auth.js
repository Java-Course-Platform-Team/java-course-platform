// ==========================================
// CONFIGURAÇÃO CENTRAL (Passo 1)
// ==========================================
const BASE_URL = "http://localhost:8081";

document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // LÓGICA DE LOGIN
    // ==========================================
    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault(); // Impede o reload da página

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            // Elementos de feedback visual (se existirem no HTML)
            const errorContainer = document.getElementById("error-container");
            const errorMessage = document.getElementById("error-message");

            // Limpa erros anteriores
            if (errorContainer) errorContainer.classList.add("hidden");

            try {
                console.log(`Tentando login em: ${BASE_URL}/auth/login`);

                // Requisição para o Backend na porta 8081
                const response = await fetch(`${BASE_URL}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                // Se o backend devolver erro (401/403/500) mas com texto em vez de JSON
                if (!response.ok) {
                    throw new Error("Falha na autenticação");
                }

                const data = await response.json();

                // 1. Salva Token e Dados
                localStorage.setItem("token", data.token);
                localStorage.setItem("userRole", data.role); // Ex: ROLE_ADMIN ou ROLE_USER
                localStorage.setItem("userName", data.name);

                console.log("Login sucesso! Role:", data.role);

                // 2. Redirecionamento Inteligente
                // Garante que a role esteja em maiúsculo e sem espaços
                const role = data.role ? data.role.toUpperCase().trim() : "";

                if (role === 'ADMIN' || role === 'ROLE_ADMIN') {
                    window.location.href = "/admin/dashboard.html";
                } else {
                    window.location.href = "/aluno/meus-cursos.html";
                }

            } catch (error) {
                console.error("Erro no login:", error);
                if (errorMessage) errorMessage.textContent = "Email ou senha incorretos (ou erro no servidor).";
                if (errorContainer) errorContainer.classList.remove("hidden");
            }
        });
    }

    // ==========================================
    // LÓGICA DE CADASTRO
    // ==========================================
    const cadastroForm = document.getElementById("cadastro-form");

    if (cadastroForm) {
        cadastroForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nome = document.getElementById("nome").value;
            const email = document.getElementById("email").value;
            const senha = document.getElementById("senha").value;
            const confirmaSenha = document.getElementById("confirma_senha").value;

            if (senha !== confirmaSenha) {
                alert("As senhas não coincidem!");
                return;
            }

            try {
                // AVISO: Pedi para o backend usar /auth/register para ser público
                console.log(`Tentando cadastro em: ${BASE_URL}/auth/register`);

                const response = await fetch(`${BASE_URL}/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: nome, email: email, password: senha, role: "USER" })
                    // Nota: role: "USER" é opcional, depende se o backend exige
                });

                if (response.ok) {
                    alert("Conta criada com sucesso! Faça login.");
                    window.location.href = "/auth/login.html";
                } else {
                    const text = await response.text();
                    alert("Erro ao cadastrar: " + text);
                }
            } catch (error) {
                console.error("Erro no cadastro:", error);
                alert("Erro de conexão com o servidor 8081.");
            }
        });
    }
});