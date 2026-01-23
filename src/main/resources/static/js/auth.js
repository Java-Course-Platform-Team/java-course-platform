// auth.js - Com Máscara de CPF e Configurações de Nuvem
// CONFIGURAÇÃO AUTOMÁTICA DE AMBIENTE
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8081"
    : "https://odonto-backend-j9oy.onrender.com";

document.addEventListener("DOMContentLoaded", () => {

    // ==================================================
    // 🎭 MÁSCARA DE CPF (O Segredo Novo)
    // ==================================================
    const cpfInput = document.getElementById("cpf");
    if (cpfInput) {
        cpfInput.addEventListener("input", (e) => {
            let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não é número
            if (value.length > 11) value = value.slice(0, 11); // Limita a 11 números

            // Adiciona os pontos e traço
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

            e.target.value = value; // Devolve formatado pro campo
        });
    }

    // ==================================================
    // 1. LÓGICA DE LOGIN
    // ==================================================
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector("button[type='submit']");

            if (typeof UI !== 'undefined') UI.buttonLoading(btn, true, "Validando...");

            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: document.getElementById("email").value.trim(),
                        password: document.getElementById("password").value
                    })
                });

                if (!response.ok) throw new Error("Acesso negado");

                const data = await response.json();

                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify({
                    id: data.id,
                    name: data.name,
                    role: data.role
                }));
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

            // Pega o CPF e remove os pontos/traços antes de enviar
            const rawCpf = document.getElementById("cpf").value.replace(/\D/g, "");

            try {
                const response = await fetch(`${API_URL}/users`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: document.getElementById("nome").value.trim(),
                        email: document.getElementById("email").value.trim(),
                        password: document.getElementById("senha").value,
                        cpf: rawCpf, // Envia só os números (Ex: 12345678900)
                        role: "STUDENT"
                    })
                });

                if (response.ok) {
                    if (typeof UI !== 'undefined') UI.toast.success("Conta criada! Redirecionando...");
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