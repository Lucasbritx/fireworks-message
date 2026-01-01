const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const messageContainer = document.getElementById('message-container');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let fireworks = [];
let particles = [];

const muteBtn = document.getElementById('muteBtn');
let isMuted = false;

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function playSound() {
    if (isMuted) return;
    let audio = new Audio('./assets/firework.wav');
    audio.volume = 0.5; 
    
    audio.play().catch(error => {
        console.log(error);
    });
}

class Firework {
    constructor(sx, sy, tx, ty) {
        this.x = sx;
        this.y = sy;
        this.sx = sx;
        this.sy = sy;
        this.tx = tx;
        this.ty = ty
        this.distanceToTarget = Math.sqrt(Math.pow(tx - sx, 2) + Math.pow(ty - sy, 2));
        this.distanceTraveled = 0;
        this.coordinates = [];
        this.coordinateCount = 3;
        while(this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = Math.atan2(ty - sy, tx - sx);
        this.speed = 2;
        this.acceleration = 1.05;
        this.brightness = random(50, 70);
        playSound('launch');
    }

    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);

        this.speed *= this.acceleration;

        const vx = Math.cos(this.angle) * this.speed;
        const vy = Math.sin(this.angle) * this.speed;

        this.distanceTraveled = Math.sqrt(Math.pow(this.sx - this.x, 2) + Math.pow(this.sy - this.y, 2));

        if (this.distanceTraveled >= this.distanceToTarget) {
            createParticles(this.tx, this.ty);
            playSound('explode');
            fireworks.splice(index, 1);
        } else {
            this.x += vx;
            this.y += vy;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = 'hsl(' + random(0, 360) + ', 100%, ' + this.brightness + '%)';
        ctx.stroke();
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.coordinates = [];
        this.coordinateCount = 5;
        while(this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = random(0, Math.PI * 2);
        this.speed = random(1, 10);
        this.friction = 0.95;
        this.gravity = 1;
        this.hue = random(0, 360);
        this.brightness = random(50, 80);
        this.alpha = 1;
        this.decay = random(0.015, 0.03);
    }

    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        
        this.speed *= this.friction;
        
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        
        this.alpha -= this.decay;

        if (this.alpha <= this.decay) {
            particles.splice(index, 1);
        }
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
        ctx.stroke();
    }
}

function createParticles(x, y) {
    let particleCount = 30;
    while (particleCount--) {
        particles.push(new Particle(x, y));
    }
}

function loop() {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.globalCompositeOperation = 'lighter';

    let i = fireworks.length;
    while(i--) {
        fireworks[i].draw();
        fireworks[i].update(i);
    }

    let j = particles.length;
    while(j--) {
        particles[j].draw();
        particles[j].update(j);
    }

    if(random(0, 100) < 5) {
        fireworks.push(new Firework(canvas.width / 2, canvas.height, random(0, canvas.width), random(0, canvas.height / 2)));
    }

    requestAnimationFrame(loop);
}

function launchMessage() {
    const input = document.getElementById('userText');
    const text = input.value;
    
    if(text.trim() === "") return;

    messageContainer.innerHTML = text;
    messageContainer.style.opacity = 1;

    for(let i = 0; i < 5; i++) {
        setTimeout(() => {
            fireworks.push(new Firework(
                canvas.width / 2, 
                canvas.height, 
                random(200, canvas.width - 200), 
                random(100, canvas.height / 2)
            ));
        }, i * 200);
    }

    setTimeout(() => {
        messageContainer.style.opacity = 0;
    }, 4000);
    
    input.value = '';
}

muteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    
    if (isMuted) {
        muteBtn.innerHTML = "🔇";
    } else {
        muteBtn.innerHTML = "🔊";
    }
});

loop();
