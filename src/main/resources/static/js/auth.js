// auth.js - Autenticação Absolute Luxury
const BASE_URL = "http://localhost:8081";

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector("button[type='submit']");
            if (typeof UI !== 'undefined') UI.buttonLoading(btn, true, "Validando...");

            try {
                const response = await fetch(`${BASE_URL}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: document.getElementById("email").value.trim(),
                        password: document.getElementById("password").value
                    })
                });

                if (!response.ok) throw new Error("Acesso negado");

                const data = await response.json();

                // SALVAMENTO UNIFICADO (Sem Mocks)
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify({
                    id: data.id, // O UUID que agora vem do Java
                    name: data.name,
                    role: data.role
                }));

                // Backwards compatibility para outros scripts
                localStorage.setItem("userName", data.name);

                if (typeof UI !== 'undefined') UI.toast.info(`Bem-vindo, Dr(a). ${data.name}!`);

                setTimeout(() => {
                    const role = data.role;
                    if (role === 'ADMIN' || role === 'ROLE_ADMIN') {
                        window.location.href = "/admin/dashboard.html";
                    } else {
                        window.location.href = "/aluno/area-aluno.html";
                    }
                }, 1500);

            } catch (error) {
                if (typeof UI !== 'undefined') UI.toast.error("E-mail ou senha inválidos.");
            } finally {
                if (typeof UI !== 'undefined') UI.buttonLoading(btn, false);
            }
        });
    }

    // Cadastro simplificado (mantendo a lógica do Felipe)
    const cadastroForm = document.getElementById("cadastro-form");
    if (cadastroForm) {
        cadastroForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = cadastroForm.querySelector("button[type='submit']");

            if (typeof UI !== 'undefined') UI.buttonLoading(submitBtn, true, "Iniciando Legado...");

            try {
                const response = await fetch(`${BASE_URL}/users`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: document.getElementById("nome").value.trim(),
                        email: document.getElementById("email").value.trim(),
                        password: document.getElementById("senha").value,
                        cpf: document.getElementById("cpf").value,
                        role: "STUDENT"
                    })
                });

                if (response.ok) {
                    UI.toast.success("Conta criada! Redirecionando...");
                    setTimeout(() => window.location.href = "/auth/login.html", 2000);
                } else {
                    const err = await response.json();
                    UI.toast.error(err.message || "Erro ao criar conta.");
                }
            } catch (error) {
                UI.toast.error("Servidor indisponível.");
            } finally {
                UI.buttonLoading(submitBtn, false);
            }
        });
    }
});