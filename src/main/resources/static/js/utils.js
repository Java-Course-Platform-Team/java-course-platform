// utils.js - Utilitários Globais (Opcional)
window.UI = {
    toast: {
        success: (msg) => showToast(msg, "success"),
        error: (msg) => showToast(msg, "error"),
        info: (msg) => showToast(msg, "info")
    },
    // Botão de loading simples
    buttonLoading: (btn, isLoading, text = "Carregando...") => {
        if (!btn) return;
        if (isLoading) {
            btn.dataset.originalText = btn.innerHTML;
            btn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> ${text}`;
            btn.disabled = true;
        } else {
            btn.innerHTML = btn.dataset.originalText || "Confirmar";
            btn.disabled = false;
        }
    }
};

// Helper interno
function showToast(msg, type) {
    if (typeof Toastify === 'function') {
        const colors = {
            success: "#D4AF37",
            error: "#ef4444",
            info: "#151515"
        };
        Toastify({
            text: msg,
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: colors[type] || "#333", color: type === "error" ? "#fff" : "#000" }
        }).showToast();
    } else {
        console.log(`[Toast ${type}]: ${msg}`);
    }
}