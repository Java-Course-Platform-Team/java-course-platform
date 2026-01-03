const BASE_URL = "http://localhost:8081";

document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. LÓGICA DE LOGIN
    // ==========================================
    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = loginForm.querySelector("button[type='submit']");

            // UX: Loading
            UI.buttonLoading(submitBtn, true, "Autenticando...");

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const errorContainer = document.getElementById("error-container");

            if (errorContainer) errorContainer.classList.add("hidden");

            try {
                const response = await fetch(`${BASE_URL}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                if (!response.ok) throw new Error("Credenciais inválidas");

                const data = await response.json();

                localStorage.setItem("token", data.token);
                localStorage.setItem("userRole", data.role || "");
                localStorage.setItem("userName", data.name);

                // UX: Sucesso
                UI.toast.info(`Bem-vindo, Dr(a). ${data.name}!`);

                setTimeout(() => {
                    const role = data.role ? data.role.toUpperCase().trim() : "";
                    if (role === 'ADMIN' || role === 'ROLE_ADMIN') {
                        window.location.href = "/admin/dashboard.html";
                    } else {
                        window.location.href = "/aluno/meus-cursos.html";
                    }
                }, 1500);

            } catch (error) {
                console.error("Erro:", error);
                UI.toast.error("E-mail ou senha incorretos.");
                if (errorContainer) {
                    errorContainer.classList.remove("hidden");
                    document.getElementById("error-message").textContent = "Credenciais inválidas.";
                }
            } finally {
                UI.buttonLoading(submitBtn, false);
            }
        });
    }

    // ==========================================
    // 2. LÓGICA DE CADASTRO
    // ==========================================
    const cadastroForm = document.getElementById("cadastro-form");

    if (cadastroForm) {
        cadastroForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = cadastroForm.querySelector("button[type='submit']");

            // UX: Loading
            UI.buttonLoading(submitBtn, true, "Criando conta...");

            const nomeInput = document.getElementById("nome").value.trim();
            const emailInput = document.getElementById("email").value.trim();
            const senhaInput = document.getElementById("senha").value;
            const confirmaSenhaInput = document.getElementById("confirma_senha").value;

            if (senhaInput !== confirmaSenhaInput) {
                UI.toast.error("As senhas não coincidem!");
                UI.buttonLoading(submitBtn, false);
                return;
            }

            const payload = {
                name: nomeInput,
                email: emailInput,
                password: senhaInput,
                role: "USER"
            };

            try {
                const response = await fetch(`${BASE_URL}/users`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    UI.toast.success("Conta criada com sucesso!");
                    setTimeout(() => window.location.href = "/auth/login.html", 2000);
                } else {
                    const errorText = await response.text();
                    UI.toast.error("Erro: " + errorText);
                }

            } catch (error) {
                UI.toast.error("Erro de conexão com o servidor.");
            } finally {
                UI.buttonLoading(submitBtn, false);
            }
        });
    }
});