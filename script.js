/* Audio Synthesizer */
class CyberSound {
    constructor() {
        this.enabled = true;
        this.ctx = null;
    }
    init() {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    play(freq, type = 'sine', duration = 0.1, vol = 0.05) {
        if (!this.enabled) return;
        try {
            this.init();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch(e){}
    }
}
const snd = new CyberSound();

/* Live Clock */
setInterval(() => {
    document.getElementById('clockDisplay').textContent = new Date().toUTCString().slice(17, 25) + ' UTC';
}, 1000);

/* Audio Visualizer Canvas */
const visCanvas = document.getElementById('audioVisualizer');
const visCtx = visCanvas.getContext('2d');
function drawVisualizer() {
    visCtx.clearRect(0, 0, visCanvas.width, visCanvas.height);
    for (let i = 0; i < 10; i++) {
        const h = Math.random() * visCanvas.height;
        visCtx.fillStyle = i % 2 === 0 ? '#00f0ff' : '#ff007f';
        visCtx.fillRect(i * 8, visCanvas.height - h, 5, h);
    }
    setTimeout(drawVisualizer, 100);
}
drawVisualizer();

/* Particle Engine */
const pCanvas = document.getElementById('particleCanvas');
const pCtx = pCanvas.getContext('2d');
let width, height, particles = [];
let mouse = { x: null, y: null, radius: 150 };

function resize() {
    width = pCanvas.width = window.innerWidth;
    height = pCanvas.height = window.innerHeight;
    mCanvas.width = width;
    mCanvas.height = height;
}
window.addEventListener('resize', resize);

class Particle {
    constructor(x, y) {
        this.x = x || Math.random() * width;
        this.y = y || Math.random() * height;
        this.radius = Math.random() * 2 + 1;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.color = Math.random() > 0.5 ? '#00f0ff' : '#ff007f';
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        if (mouse.x && mouse.y) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius) {
                let force = (mouse.radius - dist) / mouse.radius;
                this.x -= (dx / dist) * force * 4;
                this.y -= (dy / dist) * force * 4;
            }
        }
    }
    draw() {
        pCtx.beginPath();
        pCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        pCtx.fillStyle = this.color;
        pCtx.shadowBlur = 8;
        pCtx.shadowColor = this.color;
        pCtx.fill();
        pCtx.shadowBlur = 0;
    }
}

function initParticles() {
    particles = [];
    let count = Math.floor((width * height) / 9000);
    for (let i = 0; i < count; i++) particles.push(new Particle());
}

function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
            let dx = particles[a].x - particles[b].x;
            let dy = particles[a].y - particles[b].y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                pCtx.strokeStyle = `rgba(0, 240, 255, ${1 - dist / 120})`;
                pCtx.lineWidth = 0.6;
                pCtx.beginPath();
                pCtx.moveTo(particles[a].x, particles[a].y);
                pCtx.lineTo(particles[b].x, particles[b].y);
                pCtx.stroke();
            }
        }
    }
}

function animateParticles() {
    pCtx.clearRect(0, 0, width, height);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animateParticles);
}

window.addEventListener('mousemove', e => { mouse.x = e.x; mouse.y = e.y; });
window.addEventListener('click', e => {
    snd.play(600, 'square', 0.1, 0.04);
    for (let i = 0; i < 10; i++) {
        let p = new Particle(e.x, e.y);
        p.vx = (Math.random() - 0.5) * 6;
        p.vy = (Math.random() - 0.5) * 6;
        particles.push(p);
        if (particles.length > 200) particles.shift();
    }
});

/* Matrix Digital Rain Effect */
const mCanvas = document.getElementById('matrixCanvas');
const mCtx = mCanvas.getContext('2d');
const matrixChars = "01010101ABCDEFGHIJKLMNOPQRSTUVWXYZMHUSSAIN";
let drops = [];

function initMatrix() {
    let columns = Math.floor(width / 20);
    drops = [];
    for (let i = 0; i < columns; i++) drops[i] = 1;
}

function drawMatrix() {
    mCtx.fillStyle = "rgba(3, 5, 12, 0.05)";
    mCtx.fillRect(0, 0, width, height);
    mCtx.fillStyle = "#00ff66";
    mCtx.font = "15px monospace";

    for (let i = 0; i < drops.length; i++) {
        let text = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
        mCtx.fillText(text, i * 20, drops[i] * 20);
        if (drops[i] * 20 > height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
    if (!mCanvas.classList.contains('hidden')) requestAnimationFrame(drawMatrix);
}

document.getElementById('toggleMatrixBtn').addEventListener('click', () => {
    snd.play(1000, 'sawtooth', 0.2, 0.08);
    mCanvas.classList.toggle('hidden');
    if (!mCanvas.classList.contains('hidden')) {
        initMatrix();
        drawMatrix();
    }
});

/* Working Theme Style Switcher Function */
function toggleThemeStyle() {
    snd.play(750, 'square', 0.15, 0.05);
    const root = document.getElementById('htmlRoot');
    const btn = document.getElementById('themeToggleBtn');
    const title = document.getElementById('osTitle');
    const indicator = document.getElementById('hudIndicator');
    const termWelcome = document.getElementById('termWelcome');
    const termHelpAccent = document.getElementById('termHelpAccent');
    const promptUser = document.getElementById('promptUser');
    const profileRole = document.getElementById('profileRole');
    const hubTitle = document.getElementById('hubTitle');
    const statusBadge = document.getElementById('statusBadge');
    const bar1 = document.getElementById('bar1');

    if (root.getAttribute('data-theme') === 'cyan') {
        root.setAttribute('data-theme', 'matrix');
        btn.textContent = '🎨 THEME: MATRIX';
        btn.className = 'px-3 py-1 rounded bg-slate-900 border border-cyberGreen text-cyberGreen hover:bg-cyberGreen/20 transition text-[11px]';
        title.textContent = 'MATRIX_OS v5.1';
        title.className = 'font-bold text-cyberGreen glow-text-green tracking-wider';
        indicator.className = 'w-2.5 h-2.5 rounded-full bg-cyberGreen animate-pulse';
        
        termWelcome.className = 'text-cyberGreen font-bold term-welcome';
        termHelpAccent.className = 'text-cyberGreen font-bold term-help-accent';
        promptUser.className = 'text-cyberGreen font-bold prompt-user';
        profileRole.className = 'text-xs font-mono text-cyberGreen glow-text-green';
        hubTitle.className = 'font-mono text-xs text-cyberGreen font-bold flex items-center gap-1';
        statusBadge.className = 'px-2 py-0.5 rounded bg-cyberGreen/10 text-cyberGreen border border-cyberGreen/30 text-[10px]';
        bar1.className = 'bg-cyberGreen h-full rounded-full bar-1';
    } else {
        root.setAttribute('data-theme', 'cyan');
        btn.textContent = '🎨 THEME: CYAN/PINK';
        btn.className = 'px-3 py-1 rounded bg-slate-900 border border-cyberPink text-cyberPink hover:bg-cyberPink/20 transition text-[11px]';
        title.textContent = 'HUSSAIN_OS v5.1';
        title.className = 'font-bold text-cyberCyan glow-text-cyan tracking-wider';
        indicator.className = 'w-2.5 h-2.5 rounded-full bg-cyberCyan animate-pulse';
        
        termWelcome.className = 'text-cyberPink font-bold term-welcome';
        termHelpAccent.className = 'text-cyberCyan font-bold term-help-accent';
        promptUser.className = 'text-cyberPink font-bold prompt-user';
        profileRole.className = 'text-xs font-mono text-cyberPink glow-text-pink';
        hubTitle.className = 'font-mono text-xs text-cyberCyan font-bold flex items-center gap-1';
        statusBadge.className = 'px-2 py-0.5 rounded bg-cyberCyan/10 text-cyberCyan border border-cyberCyan/30 text-[10px]';
        bar1.className = 'bg-cyberCyan h-full rounded-full bar-1';
    }
}

/* Window Management */
function openWin(id) {
    snd.play(900, 'sine', 0.1, 0.03);
    const win = document.getElementById(id);
    win.style.display = 'flex';
}

function closeWin(id) {
    snd.play(300, 'triangle', 0.1, 0.03);
    document.getElementById(id).style.display = 'none';
}

/* Terminal Script Commands */
const termInput = document.getElementById('terminalInput');
const termOutput = document.getElementById('terminalOutput');

function appendTerm(html) {
    const p = document.createElement('div');
    p.innerHTML = html;
    termOutput.appendChild(p);
    termOutput.scrollTop = termOutput.scrollHeight;
}

function executeCmd(cmd) {
    const cleanCmd = cmd.trim().toLowerCase();
    appendTerm(`<p><span class="text-cyberPink">user@node:~$</span> ${cmd}</p>`);
    snd.play(800, 'triangle', 0.05, 0.02);

    switch(cleanCmd) {
        case 'help':
            appendTerm(`
                <p class="text-cyberCyan font-bold">AVAILABLE COMMANDS:</p>
                <p>• <span class="text-cyberGreen">skills</span> — Open Skills Diagnostics</p>
                <p>• <span class="text-cyberGreen">projects</span> — View Projects Gallery</p>
                <p>• <span class="text-cyberGreen">snake</span> — Launch Cyber Snake Game</p>
                <p>• <span class="text-cyberGreen">resume</span> — Open interactive Resume link</p>
                <p>• <span class="text-cyberGreen">github</span> — Open GitHub profile</p>
                <p>• <span class="text-cyberGreen">about</span> — Bio information</p>
                <p>• <span class="text-cyberGreen">clear</span> — Clear terminal output</p>
                <p>• <span class="text-cyberGreen">sudo</span> — Grant admin access</p>
            `);
            break;
        case 'skills':
            openWin('specsWin');
            appendTerm(`<p class="text-cyberGreen">Opening System Specs Diagnostics Window...</p>`);
            break;
        case 'projects':
        case 'portfolio':
            openWin('projectsWin');
            appendTerm(`<p class="text-cyberCyan">Opening Projects & Links Window...</p>`);
            break;
        case 'snake':
            openWin('snakeWin');
            appendTerm(`<p class="text-cyberGreen">Launching Cyber Snake Game...</p>`);
            break;
        case 'resume':
            window.open('https://hussain2k26.github.io/resume/', '_blank');
            appendTerm(`<p class="text-cyberPink">Opening Resume in new tab: https://hussain2k26.github.io/resume/</p>`);
            break;
        case 'github':
            window.open('https://github.com/hussain2k26', '_blank');
            appendTerm(`<p class="text-cyberCyan">Opening GitHub profile: https://github.com/hussain2k26</p>`);
            break;
        case 'about':
            appendTerm(`<p class="text-slate-300">Muhammad Hussain — Front-End Web Developer crafting modern interactive web applications in Karachi, Pakistan.</p>`);
            break;
        case 'clear':
            termOutput.innerHTML = '';
            break;
        case 'sudo':
            appendTerm(`<p class="text-red-500 font-bold">ACCESS GRANTED: Welcome, Administrator Hussain.</p>`);
            break;
        default:
            appendTerm(`<p class="text-red-400">Command not found: '${cmd}'. Type 'help' for command list.</p>`);
    }
}

termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && termInput.value !== '') {
        executeCmd(termInput.value);
        termInput.value = '';
    }
});

/* Cyber Snake Game Logic */
const snakeCanvas = document.getElementById('snakeCanvas');
const snakeCtx = snakeCanvas.getContext('2d');
const gridSize = 13;
const tileCount = 20;

let snake = [];
let food = { x: 5, y: 5 };
let dx = 0;
let dy = 0;
let snakeScore = 0;
let snakeHigh = 0;
let snakeInterval = null;
let gameRunning = false;

function startSnakeGame() {
    snd.play(1000, 'square', 0.1, 0.05);
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    dx = 1;
    dy = 0;
    snakeScore = 0;
    document.getElementById('snakeScore').textContent = snakeScore;
    spawnFood();
    
    if (snakeInterval) clearInterval(snakeInterval);
    gameRunning = true;
    snakeInterval = setInterval(gameLoop, 110);
}

function spawnFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
}

function gameLoop() {
    if (!gameRunning) return;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        snd.play(1200, 'sine', 0.08, 0.05);
        snakeScore += 10;
        document.getElementById('snakeScore').textContent = snakeScore;
        if (snakeScore > snakeHigh) {
            snakeHigh = snakeScore;
            document.getElementById('snakeHigh').textContent = snakeHigh;
        }
        spawnFood();
    } else {
        snake.pop();
    }

    snakeCtx.fillStyle = '#05070e';
    snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

    snakeCtx.fillStyle = '#ff007f';
    snakeCtx.shadowBlur = 10;
    snakeCtx.shadowColor = '#ff007f';
    snakeCtx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

    snakeCtx.fillStyle = '#00ff66';
    snakeCtx.shadowColor = '#00ff66';
    snake.forEach((part) => {
        snakeCtx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
    });
    snakeCtx.shadowBlur = 0;
}

function gameOver() {
    gameRunning = false;
    clearInterval(snakeInterval);
    snd.play(200, 'sawtooth', 0.3, 0.1);
    snakeCtx.fillStyle = 'rgba(3, 5, 12, 0.85)';
    snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
    snakeCtx.fillStyle = '#ff007f';
    snakeCtx.font = '14px Courier New';
    snakeCtx.textAlign = 'center';
    snakeCtx.fillText("GAME OVER!", snakeCanvas.width / 2, snakeCanvas.height / 2 - 10);
    snakeCtx.fillStyle = '#00f0ff';
    snakeCtx.fillText(`Score: ${snakeScore}`, snakeCanvas.width / 2, snakeCanvas.height / 2 + 15);
}

window.addEventListener('keydown', e => {
    if (!gameRunning) return;
    switch(e.key) {
        case 'ArrowUp': if (dy === 0) { dx = 0; dy = -1; } e.preventDefault(); break;
        case 'ArrowDown': if (dy === 0) { dx = 0; dy = 1; } e.preventDefault(); break;
        case 'ArrowLeft': if (dx === 0) { dx = -1; dy = 0; } e.preventDefault(); break;
        case 'ArrowRight': if (dx === 0) { dx = 1; dy = 0; } e.preventDefault(); break;
    }
});

/* Audio Toggle */
const audioBtn = document.getElementById('audioToggleBtn');
audioBtn.addEventListener('click', () => {
    snd.enabled = !snd.enabled;
    audioBtn.textContent = snd.enabled ? '🔊 SOUND: ON' : '🔇 SOUND: OFF';
});

/* Startup Init */
window.onload = () => {
    resize();
    initParticles();
    animateParticles();
};