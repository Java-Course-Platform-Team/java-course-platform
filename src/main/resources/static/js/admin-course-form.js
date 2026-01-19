const form = document.getElementById("course-form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const data = Object.fromEntries(new FormData(form).entries());

    try {
        const res = await fetch(`${API_URL}/courses`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            Toastify({ text: "Curso Publicado! 🏆", duration: 3000, style: { background: "#D4AF37" } }).showToast();
            form.reset(); // LIMPA O FORMULÁRIO
            setTimeout(() => window.location.href = "gerenciar-cursos.html", 1500);
        }
    } catch (e) { console.error(e); }
});