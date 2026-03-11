const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("contador");
const btnReset = document.getElementById("btn-reset");

canvas.width = 1100;
canvas.height = 600;

let puntos = 0;
let tetos = [];
const tetoImg = new Image();
tetoImg.src = "assets/TetoPeluche.png"; 

class TetoEntidad {
    constructor() {
        this.init();
    }

    init() {
        this.size = Math.random() * 30 + 55;
        this.radius = this.size / 2;
        this.posX = Math.random() * (canvas.width - this.size) + this.radius;
        this.posY = -this.size - (Math.random() * 400);
        
        let mult = puntos > 20 ? 3.0 : (puntos > 10 ? 2.0 : 1.2);
        this.dy = (Math.random() * 2 + 1) * mult;
        this.dx = (Math.random() - 0.5) * 4; 
        
        this.isColliding = false;
        this.mass = this.radius;
    }

    draw() {
        ctx.save();
        if (this.isColliding) {
            ctx.shadowColor = "red";
            ctx.shadowBlur = 15;
            ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.drawImage(tetoImg, this.posX - this.radius, this.posY - this.radius, this.size, this.size);
        ctx.restore();
    }

    update(all) {
        this.isColliding = false;
        for (let other of all) {
            if (this === other) continue;
            let dx = this.posX - other.posX;
            let dy = this.posY - other.posY;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let minD = this.radius + other.radius;

            if (distance < minD) {
                this.isColliding = true;
                this.resolveCollision(other, dx, dy, distance, minD);
            }
        }

        this.posX += this.dx;
        this.posY += this.dy;

        if (this.posX + this.radius > canvas.width || this.posX - this.radius < 0) this.dx = -this.dx;
        if (this.posY - this.radius > canvas.height) this.init();

        this.draw();
    }

    resolveCollision(other, dx, dy, dist, minD) {
        let overlap = minD - dist;
        let nx = dx / dist;
        let ny = dy / dist;
        this.posX += nx * (overlap / 2);
        this.posY += ny * (overlap / 2);
        other.posX -= nx * (overlap / 2);
        other.posY -= ny * (overlap / 2);

        let dot = (this.dx - other.dx) * nx + (this.dy - other.dy) * ny;
        if (dot < 0) {
            let impulse = (2 * dot) / (this.mass + other.mass);
            this.dx -= impulse * other.mass * nx;
            this.dy -= impulse * other.mass * ny;
            other.dx += impulse * this.mass * nx;
            other.dy += impulse * this.mass * ny;
        }
    }

    checkClick(mX, mY) {
        let dx = mX - this.posX;
        let dy = mY - this.posY;
        if (Math.sqrt(dx * dx + dy * dy) < this.radius) {
            puntos++;
            scoreElement.innerText = puntos;
            this.init();
            return true;
        }
        return false;
    }
}

function start() {
    puntos = 0;
    scoreElement.innerText = puntos;
    tetos = [];
    for (let i = 0; i < 10; i++) tetos.push(new TetoEntidad());
}

btnReset.addEventListener("click", start);

canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mX = e.clientX - rect.left;
    const mY = e.clientY - rect.top;
    for (let t of tetos) if (t.checkClick(mX, mY)) break;
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tetos.forEach(t => t.update(tetos));
    requestAnimationFrame(animate);
}

tetoImg.onload = () => { 
    start(); 
    animate(); 
};