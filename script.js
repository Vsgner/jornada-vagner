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
    const count = window.innerWidth < 600 ? 100 : 200; 

   
    if (!isGold) particles = []; 

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * cCanvas.width,
           
            y: isGold ? Math.random() * cCanvas.height : Math.random() * cCanvas.height - cCanvas.height,
            
            
            color: isGold ? 
                `rgba(255, 215, 0, ${Math.random() * 0.6 + 0.4})` : 
                (Math.random() > 0.15 ? `rgba(157, 0, 255, ${Math.random() * 0.5 + 0.3})` : `rgba(212, 175, 55, ${Math.random() * 0.6 + 0.4})`),
            
            size: Math.random() * 1.5 + 0.5, 
            length: Math.random() * 40 + 15, 
            speed: isGold ? Math.random() * 20 + 10 : Math.random() * 4 + 2, 
            
            
            angle: isGold ? -Math.PI / 2 + (Math.random() * 0.1 - 0.05) : Math.PI / 2 + (Math.random() * 0.05 - 0.025) 
        });
    }
}

function updateParticles() {
   
    cCtx.fillStyle = "rgba(0, 0, 0, 0.2)";
    cCtx.fillRect(0, 0, cCanvas.width, cCanvas.height);

   
    if (isGoldenAscension) {
        cCtx.fillStyle = "rgba(255, 215, 0, 0.05)";
        cCtx.fillRect(0, 0, cCanvas.width, cCanvas.height);
    }

    
    cCtx.globalCompositeOperation = "screen"; 

    particles.forEach((p, i) => {
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;

        cCtx.strokeStyle = p.color;
        cCtx.lineWidth = p.size;
        cCtx.lineCap = "round";
        
        cCtx.beginPath();
        cCtx.moveTo(p.x, p.y);
        
        cCtx.lineTo(p.x - Math.cos(p.angle) * p.length, p.y - Math.sin(p.angle) * p.length);
        cCtx.stroke();

        if (!isGoldenAscension) {
            
            if (p.y > cCanvas.height + p.length) {
                p.y = -p.length;
                p.x = Math.random() * cCanvas.width;
            }
        } else {
            
            if (p.y < -p.length) {
                particles.splice(i, 1);
            }
        }
    });

    
    cCtx.globalCompositeOperation = "source-over"; 

    
    if (particles.length > 0 || climaxActive) requestAnimationFrame(updateParticles);
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
        
        // Cores neon/deep purple que reagem ao progresso
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