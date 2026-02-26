const audio = document.getElementById('bg-music');
const startBtn = document.getElementById('start-btn');
const endBtn = document.getElementById('end-btn');
const progressBar = document.getElementById('v-progress-bar');
const progressText = document.getElementById('progress-text');
const envelopeWrapper = document.getElementById('envelope-wrapper');
const modal = document.getElementById('reading-modal');
const finalScreen = document.getElementById('final-screen');

let climaxActive = false;
let rotationTween;
const CLIMAX_TIME = 49;

const cCanvas = document.getElementById('climax-canvas');
const cCtx = cCanvas.getContext('2d');
let particles = [];
let isGoldenAscension = false;

// ==========================================
// EFEITO 1: POEIRA ESTELAR (FAGULHAS DOURADAS EM GRAVIDADE ZERO)
// ==========================================
function createExplosion(isGold = false) {
    cCanvas.width = window.innerWidth;
    cCanvas.height = window.innerHeight;
    
    // Mais partículas, mas muito mais delicadas e pequenas
    const count = window.innerWidth < 600 ? 150 : 300; 

    if (!isGold) particles = []; 

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * cCanvas.width,
            y: Math.random() * cCanvas.height, // Nascem espalhadas por todo o ecrã
            
            // Cores: 80% Dourado suave/brilhante, 20% branco etéreo para dar profundidade
            color: isGold ? 
                `rgba(255, 215, 0, ${Math.random() * 0.8 + 0.2})` : 
                (Math.random() > 0.2 ? `rgba(212, 175, 55, ${Math.random() * 0.7 + 0.3})` : `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2})`),
            
            size: Math.random() * 2.5 + 0.5, // Partículas pequenas como poeira
            
            // Velocidade: flutuam lentamente para cima e um pouco para os lados (gravidade zero)
            speedX: (Math.random() - 0.5) * 0.4, 
            speedY: isGold ? -(Math.random() * 4 + 2) : -(Math.random() * 0.8 + 0.2), 
            
            // Sistema de pulsação de luz (brilho que acende e apaga suavemente)
            opacity: Math.random(),
            pulseSpeed: Math.random() * 0.03 + 0.01 
        });
    }
}

function updateParticles() {
    cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height);

    if (isGoldenAscension) {
        cCtx.fillStyle = "rgba(255, 215, 0, 0.05)";
        cCtx.fillRect(0, 0, cCanvas.width, cCanvas.height);
    }

    // Blend mode para as partículas brilharem intensamente como luz
    cCtx.globalCompositeOperation = "screen"; 

    particles.forEach((p, i) => {
        // Movimento
        p.x += p.speedX;
        p.y += p.speedY;

        // Pulsação do brilho
        p.opacity += p.pulseSpeed;
        if (p.opacity > 1 || p.opacity < 0.2) p.pulseSpeed *= -1; // Inverte quando chega ao limite

        // Efeito visual da partícula com "glow" (brilho difuso)
        cCtx.beginPath();
        cCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        cCtx.fillStyle = p.color;
        cCtx.globalAlpha = Math.abs(p.opacity);
        
        cCtx.shadowBlur = p.size * 4; // Cria o halo de luz em volta da partícula
        cCtx.shadowColor = p.color;
        
        cCtx.fill();

        // Se a poeira sair do ecrã, recolocamo-la suavemente do outro lado
        if (!isGoldenAscension) {
            if (p.y < -10) p.y = cCanvas.height + 10;
            if (p.x < -10) p.x = cCanvas.width + 10;
            if (p.x > cCanvas.width + 10) p.x = -10;
        } else {
            // Na ascensão final, deixamos fugir para desaparecer
            if (p.y < -10) particles.splice(i, 1);
        }
    });

    // Reset para não interferir com outros elementos do canvas
    cCtx.shadowBlur = 0;
    cCtx.globalAlpha = 1;
    cCtx.globalCompositeOperation = "source-over"; 

    if (particles.length > 0 || climaxActive) requestAnimationFrame(updateParticles);
}

// ==========================================
// FLUXO DA JORNADA
// ==========================================
function startExperience() {
    gsap.to("#intro-overlay", {
        opacity: 0,
        duration: 1.5,
        onComplete: () => {
            document.getElementById('intro-overlay').style.display = 'none';
        }
    });
    audio.play();

    rotationTween = gsap.to(envelopeWrapper, {
        rotateY: 360,
        rotateX: 10,
        duration: 15,
        repeat: -1,
        ease: "none"
    });

    const checkTime = setInterval(() => {
        const t = audio.currentTime;
        const pct = (t / CLIMAX_TIME) * 100;
        if (pct <= 100) {
            progressBar.style.width = pct + "%";
            if (pct > 20) progressText.innerText = "Relembrando o caminho...";
            if (pct > 80) progressText.innerText = "O momento chegou.";
        }
        if (t >= CLIMAX_TIME && !climaxActive) {
            climaxActive = true;
            clearInterval(checkTime);
            triggerClimax();
        }
    }, 100);
}

function triggerClimax() {
    createExplosion(false);
    updateParticles();
    gsap.to(".ui-container", {
        opacity: 0,
        duration: 0.5
    });

    rotationTween.kill();
    gsap.to(envelopeWrapper, {
        scale: 0,
        opacity: 0,
        rotationY: 0,
        duration: 1,
        ease: "back.in(2)"
    });

    setTimeout(() => {
        modal.classList.add('active');
        const blocks = document.querySelectorAll('.t-block');
        blocks.forEach((b, i) => {
            setTimeout(() => b.classList.add('visible'), i * 300);
        });

        setTimeout(() => {
            gsap.to(".finale-trigger", {
                opacity: 1,
                duration: 2
            });
        }, blocks.length * 300 + 2000);

    }, 800);
}

function finishJourney() {
    isGoldenAscension = true;

    gsap.to("#reading-modal", {
        opacity: 0,
        duration: 1.5,
        pointerEvents: "none"
    });

    particles = [];
    createExplosion(true);

    const flash = document.querySelector('.final-flash');
    flash.classList.add('active');

    setTimeout(() => {
        finalScreen.classList.add('active');
        flash.style.opacity = 0;
    }, 2000);
}

startBtn.addEventListener('click', startExperience);
endBtn.addEventListener('click', finishJourney);

// ==========================================
// EFEITO 2: NÉVOA DINÂMICA (FUMAÇA)
// ==========================================
const mCanvas = document.getElementById('mist-canvas');
const mCtx = mCanvas.getContext('2d');
let mParticles = [];

function initMist() {
    mCanvas.width = window.innerWidth;
    mCanvas.height = window.innerHeight;
    mParticles = [];
    
    const particleCount = window.innerWidth < 600 ? 15 : 30;
    
    for (let i = 0; i < particleCount; i++) {
        mParticles.push({
            x: Math.random() * mCanvas.width,
            y: Math.random() * mCanvas.height,
            r: Math.random() * 250 + 150,
            angle: Math.random() * Math.PI * 2,
            baseSpeed: Math.random() * 0.4 + 0.1,
            oscillation: Math.random() * 0.02 + 0.005,
            baseAlpha: Math.random() * 0.2 + 0.05
        });
    }
}

function animMist() {
    mCtx.clearRect(0, 0, mCanvas.width, mCanvas.height);

    let progress = 0;
    if (audio && audio.currentTime) {
        progress = Math.min(audio.currentTime / CLIMAX_TIME, 1);
    }

    mParticles.forEach(p => {
        p.angle += p.oscillation;
        p.y -= (p.baseSpeed + (progress * 2.5)); 
        p.x += Math.sin(p.angle) * 1.5;

        if (p.y < -p.r) {
            p.y = mCanvas.height + p.r;
            p.x = Math.random() * mCanvas.width;
        }

        let currentAlpha = p.baseAlpha + (progress * 0.3);
        if (currentAlpha > 0.6) currentAlpha = 0.6;

        let g = mCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        
        g.addColorStop(0, `rgba(157, 0, 255, ${currentAlpha})`);
        g.addColorStop(0.5, `rgba(75, 0, 130, ${currentAlpha * 0.5})`);
        g.addColorStop(1, 'transparent');

        mCtx.globalCompositeOperation = 'screen'; 
        mCtx.fillStyle = g;
        mCtx.beginPath();
        mCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        mCtx.fill();
    });
    
    mCtx.globalCompositeOperation = 'source-over'; 

    if (!isGoldenAscension) {
        requestAnimationFrame(animMist);
    }
}

window.addEventListener('resize', () => {
    initMist();
});

initMist();
animMist();