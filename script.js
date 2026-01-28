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

function createExplosion(isGold = false) {
    cCanvas.width = window.innerWidth;
    cCanvas.height = window.innerHeight;
    const count = window.innerWidth < 600 ? 150 : 350;

    for (let i = 0; i < count; i++) {
        particles.push({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            color: isGold ?
                `hsl(50, 100%, ${Math.random()*40 + 50}%)` :
                (Math.random() > 0.3 ? `hsl(${Math.random()*60 + 250}, 100%, 60%)` : '#d4af37'),
            size: Math.random() * 8 + 4,
            speed: isGold ? Math.random() * 40 + 20 : Math.random() * 25 + 10,
            angle: Math.random() * Math.PI * 2,
            decay: isGold ? 0 : Math.random() * 0.02 + 0.015,
            z: 0
        });
    }
}

function updateParticles() {
    cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height);

    if (isGoldenAscension) {
        cCtx.fillStyle = "rgba(255, 215, 0, 0.05)";
        cCtx.fillRect(0, 0, cCanvas.width, cCanvas.height);
    }

    particles.forEach((p, i) => {
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;

        if (!isGoldenAscension) {
            p.speed *= 0.95;
            p.size *= 0.96;
            p.alpha = p.size / 10;
        } else {
            p.size += 0.2;
        }

        cCtx.globalAlpha = isGoldenAscension ? 1 : (p.size / 10);
        cCtx.fillStyle = p.color;
        cCtx.beginPath();
        cCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        cCtx.fill();

        if (!isGoldenAscension && p.size < 0.1) particles.splice(i, 1);
    });

    if (particles.length > 0 || isGoldenAscension) requestAnimationFrame(updateParticles);
}

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

const mCanvas = document.getElementById('mist-canvas');
const mCtx = mCanvas.getContext('2d');
let mParticles = [];

function initMist() {
    mCanvas.width = window.innerWidth;
    mCanvas.height = window.innerHeight;
    
    for (let i = 0; i < 60; i++) mParticles.push({
        x: Math.random() * mCanvas.width,
        y: Math.random() * mCanvas.height,
        r: Math.random() * 100 + 50,
        dx: (Math.random() - .5) * 0.5,
        dy: (Math.random() - .5) * 0.5
    });
}

function animMist() {
    mCtx.clearRect(0, 0, mCanvas.width, mCanvas.height);
    mParticles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > mCanvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > mCanvas.height) p.dy *= -1;
        let g = mCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
    
        g.addColorStop(0, 'rgba(120, 20, 180, 0.4)');
        g.addColorStop(1, 'transparent');
        mCtx.fillStyle = g;
        mCtx.beginPath();
        mCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        mCtx.fill();
    });
    requestAnimationFrame(animMist);
}
initMist();
animMist();