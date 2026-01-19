<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth bg-black">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OdontoPro | Absolute Legacy</title>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css">
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/toastify-js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Manrope:wght@400;800&display=swap" rel="stylesheet">

    <style>
        html, body { cursor: none !important; background-color: #000; overflow-x: hidden; color: white; }
        
        /* Cursor de Ouro que "Arrisca" o Site */
        #cursor-canvas { position: fixed; inset: 0; pointer-events: none; z-index: 9999; }
        #cursor-core { width: 6px; height: 6px; background-color: #D4AF37; border-radius: 50%; position: fixed; pointer-events: none; z-index: 10000; box-shadow: 0 0 10px #D4AF37; }

        .gold-shimmer {
            background: linear-gradient(90deg, #B38728 0%, #FBF5B7 50%, #B38728 100%);
            background-size: 200% auto;
            -webkit-background-clip: text; background-clip: text; color: transparent;
            animation: shimmer 5s linear infinite;
        }
        @keyframes shimmer { to { background-position: 200% center; } }

        .stat-number { font-family: 'Playfair Display', serif; font-weight: 700; color: #FFFFFF; }
    </style>
</head>
<body class="antialiased">

<canvas id="cursor-canvas"></canvas>
<div id="cursor-core"></div>

<nav class="fixed w-full z-[60] py-10 px-10 flex justify-between items-center">
    <span class="text-3xl tracking-[0.3em] font-serif gold-shimmer uppercase italic">OdontoPro</span>
    <div class="flex gap-10 text-[10px] font-bold uppercase tracking-[0.5em] text-white">
        <a href="/auth/login.html" class="hover:text-gold transition">Acesso Aluno</a>
        <a href="/auth/cadastro.html" class="bg-gold text-black px-10 py-3 shadow-[0_0_20px_rgba(212,175,55,0.4)]">Matrícula</a>
    </div>
</nav>

<section class="h-screen flex items-center justify-center text-center">
    <div class="max-w-5xl px-6">
        <h1 class="text-8xl md:text-[11rem] font-serif text-white mb-8 leading-none tracking-tighter uppercase italic" id="hero-title"></h1>
        <p class="text-gray-500 text-2xl font-light tracking-widest uppercase italic">O Novo Padrão da Elite</p>
    </div>
</section>

<section id="stats-area" class="py-40 bg-black relative z-10 border-y border-white/10">
    <div class="max-w-7xl mx-auto px-10 grid grid-cols-1 md:grid-cols-4 gap-20 text-center">
        <div>
            <div class="text-8xl stat-number luxury-counter" data-target="15400">0</div>
            <p class="text-gold text-[10px] uppercase tracking-[0.5em] mt-4">Alunos Certificados</p>
        </div>
        <div>
            <div class="text-8xl stat-number"><span class="luxury-counter" data-target="98">0</span>%</div>
            <p class="text-gold text-[10px] uppercase tracking-[0.5em] mt-4">Aprovação Master</p>
        </div>
        <div>
            <div class="text-8xl stat-number luxury-counter" data-target="120">0</div>
            <p class="text-gold text-[10px] uppercase tracking-[0.5em] mt-4">Cursos Publicados</p>
        </div>
        <div>
            <div class="text-8xl stat-number gold-shimmer italic">24/7</div>
            <p class="text-gold text-[10px] uppercase tracking-[0.5em] mt-4">Suporte Concierge</p>
        </div>
    </div>
</section>

<script>
    // --- 1. MOTOR DE NÚMEROS (IGNIÇÃO FORÇADA) ---
    function startLegacyCounters() {
        document.querySelectorAll('.luxury-counter').forEach(el => {
            if (el.dataset.active === "true") return;
            el.dataset.active = "true";
            
            const target = parseInt(el.dataset.target);
            let current = 0;
            const duration = 2000;
            const startTime = performance.now();

            function animate(now) {
                const progress = Math.min((now - startTime) / duration, 1);
                current = Math.floor(progress * target);
                el.innerText = current.toLocaleString('pt-BR');
                if (progress < 1) requestAnimationFrame(animate);
                else el.innerText = target.toLocaleString('pt-BR');
            }
            requestAnimationFrame(animate);
        });
    }

    // --- 2. CURSOR QUE RISCA O SITE (ANIMAÇÃO ABSURDA) ---
    const canvas = document.getElementById('cursor-canvas');
    const ctx = canvas.getContext('2d');
    const core = document.getElementById('cursor-core');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let points = [];

    window.addEventListener('mousemove', (e) => {
        core.style.left = e.clientX + 'px';
        core.style.top = e.clientY + 'px';
        core.style.transform = 'translate(-50%, -50%)';
        
        points.push({ x: e.clientX, y: e.clientY, life: 1.0 });
    });

    function drawCursorTrail() {
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        if (points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
                points[i].life -= 0.02;
                if (points[i].life <= 0) { points.splice(i, 1); i--; }
            }
            ctx.stroke();
        }
        requestAnimationFrame(drawCursorTrail);
    }
    drawCursorTrail();

    // --- 3. GATILHOS DE SEGURANÇA ---
    window.addEventListener('load', () => {
        // Typing Effect
        const title = document.getElementById('hero-title');
        const text = "LEGADO.";
        let char = 0;
        const typing = setInterval(() => {
            if(char < text.length) { title.innerHTML += text[char]; char++; }
            else clearInterval(typing);
        }, 200);

        // Gatilho por Visibilidade
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => { if (entry.isIntersecting) startLegacyCounters(); });
        }, { threshold: 0.1 });
        observer.observe(document.getElementById('stats-area'));

        // Backup Nuclear: Se nada acontecer em 3 segundos, force agora.
        setTimeout(startLegacyCounters, 3000);
    });
</script>
</body>
</html>