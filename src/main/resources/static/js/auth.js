// ==========================================
// AUTENTICAÇÃO E VALIDAÇÃO FRONTEND (CORRIGIDO COM CPF)
// ==========================================
const BASE_URL = "http://localhost:8081";

document.addEventListener("DOMContentLoaded", () => {

    // --- 1. LÓGICA DE LOGIN ---
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector("button[type='submit']");
            UI.buttonLoading(btn, true, "Autenticando...");

            try {
                const response = await fetch(`${BASE_URL}/auth/login`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: document.getElementById("email").value.trim(), password: document.getElementById("password").value })
                });

                if (!response.ok) throw new Error("Credenciais inválidas");
                const data = await response.json();

                localStorage.setItem("token", data.token);
                localStorage.setItem("userRole", data.role);
                localStorage.setItem("userName", data.name);

                UI.toast.info(`Bem-vindo, Dr(a). ${data.name}!`);

                setTimeout(() => {
                    if (data.role === 'ADMIN' || data.role === 'ROLE_ADMIN') {
                        window.location.href = "/admin/dashboard.html";
                    } else {
                        window.location.href = "/aluno/catalogo.html";
                    }
                }, 1500);

            } catch (error) {
                UI.toast.error("E-mail ou senha incorretos.");
            } finally { UI.buttonLoading(btn, false); }
        });
    }

    // --- 2. LÓGICA DE CADASTRO ---
    const cadastroForm = document.getElementById("cadastro-form");
    if (cadastroForm) {
        const cpfInput = document.getElementById("cpf");
        // Máscara visual do CPF
        if (cpfInput) {
            cpfInput.addEventListener("input", (e) => {
                let v = e.target.value.replace(/\D/g, "");
                if (v.length > 11) v = v.slice(0, 11);
                v = v.replace(/(\d{3})(\d)/, "$1.$2");
                v = v.replace(/(\d{3})(\d)/, "$1.$2");
                v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                e.target.value = v;
            });
        }

        cadastroForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = cadastroForm.querySelector("button[type='submit']");

            const nome = document.getElementById("nome").value.trim();
            const cpfVisual = document.getElementById("cpf").value; // O valor com pontos e traço
            const cpfLimpo = cpfVisual.replace(/\D/g, ""); // Só números para validar tamanho
            const email = document.getElementById("email").value.trim();
            const confirmaEmail = document.getElementById("confirma_email").value.trim();
            const senha = document.getElementById("senha").value;
            const confirmaSenha = document.getElementById("confirma_senha").value;

            // --- Validações ---
            if (cpfLimpo.length !== 11) {
                UI.toast.error("CPF inválido. Digite os 11 números.");
                document.getElementById("cpf").focus();
                return;
            }
            if (email !== confirmaEmail) {
                UI.toast.error("Os e-mails não coincidem!");
                return;
            }
            if (!email.includes("@") || !email.includes(".")) {
                UI.toast.error("Digite um e-mail válido.");
                return;
            }
            if (senha.length < 6) {
                UI.toast.error("A senha deve ter no mínimo 6 caracteres.");
                return;
            }
            if (senha !== confirmaSenha) {
                UI.toast.error("As senhas não conferem.");
                return;
            }

            UI.buttonLoading(submitBtn, true, "Criando conta...");

            try {
                const response = await fetch(`${BASE_URL}/users`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: nome,
                        email: email,
                        password: senha,
                        cpf: cpfVisual,

                        role: "STUDENT"
                    })
                });

                if (response.ok) {
                    UI.toast.success("Conta criada com sucesso! Redirecionando...");
                    setTimeout(() => window.location.href = "/auth/login.html", 2000);
                } else {
                    // Tenta ler o erro que o Backend mandou (ex: "Email já existe")
                    const errorText = await response.text();
                    // Tenta ver se é JSON ou texto puro
                    try {
                         const errJson = JSON.parse(errorText);
                         UI.toast.error(errJson.message || "Erro ao criar conta.");
                    } catch(e) {
                         UI.toast.error(errorText || "Erro ao criar conta.");
                    }
                }
            } catch (error) {
                console.error(error);
                UI.toast.error("Erro de conexão. O servidor está rodando?");
            } finally {
                UI.buttonLoading(submitBtn, false);
            }
        });
    }
});