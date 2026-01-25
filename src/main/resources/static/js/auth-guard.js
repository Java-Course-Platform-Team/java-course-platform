// auth-guard.js - O SEGURANÇA DA PORTA
// Esse código roda IMEDIATAMENTE, antes de carregar o resto da página.

(function() {
    console.log("🔒 Segurança: Verificando credenciais...");

    // 1. VERIFICA A PULSEIRA (Token)
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');

    // Se não tiver token ou usuário salvo, CHUTA pro login
    if (!token || !userJson) {
        console.warn("⛔ Acesso negado: Sem token. Redirecionando...");
        window.location.href = '/auth/login.html';
        return; // Para a execução aqui
    }

    // 2. LÊ O CRACHÁ (Role/Cargo)
    let user;
    try {
        user = JSON.parse(userJson);
    } catch (e) {
        // Se o crachá estiver rasgado (JSON inválido), manda logar de novo
        localStorage.clear();
        window.location.href = '/auth/login.html';
        return;
    }

    const currentPath = window.location.pathname;

    // 3. REGRA DA ÁREA VIP (Admin)
    // Se a URL tem "/admin/" e o usuário NÃO é "ADMIN"
    if (currentPath.includes('/admin/') && user.role !== 'ADMIN') {
        alert("⛔ Acesso Negado: Área restrita para administradores.");
        window.location.href = '/aluno/area-aluno.html'; // Chuta pra pista comum
        return;
    }

    // 4. REGRA DA ÁREA DE ALUNO
    // (Opcional) Se quiser impedir Admin de ver área de aluno, coloque aqui.
    // Mas geralmente Admin pode ver tudo, então deixamos passar.

    console.log(`✅ Acesso autorizado para: ${user.name} (${user.role})`);

})();