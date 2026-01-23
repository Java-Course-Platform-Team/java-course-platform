// auth.js - Autenticação & Cadastro (Corrigido para Nuvem)
//  CONFIGURAÇÃO AUTOMÁTICA DE AMBIENTE
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8081"                  // Se estou no PC, uso IntelliJ Local
    : "https://odonto-backend-j9oy.onrender.com"; // Se estou na Web, uso a Nuvem

document.addEventListener("DOMContentLoaded", () => {

    // ==================================================
    // 1. LÓGICA DE LOGIN
    // ==================================================
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector("button[type='submit']");

            // Feedback visual (se a lib UI existir)
            if (typeof UI !== 'undefined') UI.buttonLoading(btn, true, "Validando...");

            try {
                // Chama o AuthController.java (@PostMapping("/login"))
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

                // SALVA TUDO NO LOCALSTORAGE
                localStorage.setItem("token", data.token);
                // Salva o objeto completo (ID agora é UUID vindo do Java)
                localStorage.setItem("user", JSON.stringify({
                    id: data.id,
                    name: data.name,
                    role: data.role
                }));
                // Mantém compatibilidade com scripts antigos
                localStorage.setItem("userName", data.name);

                if (typeof UI !== 'undefined') UI.toast.info(`Bem-vindo, Dr(a). ${data.name}!`);

                // REDIRECIONAMENTO INTELIGENTE
                setTimeout(() => {
                    const role = data.role;
                    if (role === 'ADMIN' || role === 'ROLE_ADMIN') {
                        window.location.href = "/admin/dashboard.html";
                    } else {
                        window.location.href = "/aluno/area-aluno.html";
                    }
                }, 1500);

            } catch (error) {
                console.error(error);
                if (typeof UI !== 'undefined') UI.toast.error("E-mail ou senha inválidos.");
                else alert("E-mail ou senha inválidos.");
            } finally {
                if (typeof UI !== 'undefined') UI.buttonLoading(btn, false);
            }
        });
    }

    // ==================================================
    // 2. LÓGICA DE CADASTRO
    // ==================================================
    const cadastroForm = document.getElementById("cadastro-form");
    if (cadastroForm) {
        cadastroForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = cadastroForm.querySelector("button[type='submit']");

            if (typeof UI !== 'undefined') UI.buttonLoading(submitBtn, true, "Criando conta...");

            try {
                // ATENÇÃO: Usando /users porque seu SecurityConfig liberou essa rota
                // .requestMatchers(HttpMethod.POST, ... "/users").permitAll()
                const response = await fetch(`${BASE_URL}/users`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: document.getElementById("nome").value.trim(),
                        email: document.getElementById("email").value.trim(),
                        password: document.getElementById("senha").value,
                        cpf: document.getElementById("cpf").value,
                        role: "STUDENT" // Força o cadastro como aluno
                    })
                });

                if (response.ok) {
                    if (typeof UI !== 'undefined') UI.toast.success("Conta criada! Redirecionando para login...");
                    else alert("Conta criada com sucesso!");

                    setTimeout(() => window.location.href = "/auth/login.html", 2000);
                } else {
                    const err = await response.json();
                    if (typeof UI !== 'undefined') UI.toast.error(err.message || "Erro ao criar conta.");
                    else alert("Erro: " + (err.message || "Tente novamente."));
                }
            } catch (error) {
                console.error(error);
                if (typeof UI !== 'undefined') UI.toast.error("Servidor indisponível ou erro de conexão.");
            } finally {
                if (typeof UI !== 'undefined') UI.buttonLoading(submitBtn, false);
            }
        });
    }
});