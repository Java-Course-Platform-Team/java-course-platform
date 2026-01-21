// utils.js - Motor de Interface de Luxo
const UI = {
    toast: {
        success: (msg) => UI.showToast(msg, "linear-gradient(to right, #D4AF37, #B38728)"),
        error: (msg) => UI.showToast(msg, "linear-gradient(to right, #ff5f6d, #ffc371)"),
        info: (msg) => UI.showToast(msg, "#151515")
    },
    showToast: (text, background) => {
        if (typeof Toastify !== 'undefined') {
            Toastify({
                text, duration: 3000, gravity: "top", position: "right",
                style: { background, borderRadius: "8px", fontSize: "12px", fontWeight: "bold" }
            }).showToast();
        }
    },
    buttonLoading: (btn, isLoading, text = "Processando...") => {
        if (!btn) return;
        if (isLoading) {
            btn.dataset.oldText = btn.innerHTML;
            btn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> ${text}`;
            btn.disabled = true;
        } else {
            btn.innerHTML = btn.dataset.oldText || "Confirmar";
            btn.disabled = false;
        }
    }
};