const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const window_height = window.innerHeight;
const window_width = window.innerWidth;

canvas.height = window_height;
canvas.width = window_width;
canvas.style.background = "#ff8";

class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.originalColor = color; 
        this.color = color;         
        this.text = text;
        this.speed = speed;

        // Dirección aleatoria inicial basada en la velocidad
        this.dx = (Math.random() < 0.5 ? 1 : -1) * this.speed;
        this.dy = (Math.random() < 0.5 ? 1 : -1) * this.speed;
    }

    draw(context) {
        context.beginPath();
        context.strokeStyle = this.color;
        context.fillStyle = this.color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "bold 14px Arial";
        
        context.fillText(this.text, this.posX, this.posY);

        context.lineWidth = 3;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();
    }

    update(context, allCircles) {
        // 1. Detectar colisiones con otros círculos
        let isCollidingNow = false;

        for (let other of allCircles) {
            if (this === other) continue; 

            if (this.checkCollision(other)) {
                isCollidingNow = true;
                this.resolveCollision(other); // Cambiar dirección (Rebote)
            }
        }

        // 2. Efecto visual: "Flashear" azul si hay colisión
        this.color = isCollidingNow ? "#0000FF" : this.originalColor;

        // 3. Rebote en bordes del Canvas
        if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
            this.dx = -this.dx;
        }
        if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
            this.dy = -this.dy;
        }

        // 4. Mover el círculo
        this.posX += this.dx;
        this.posY += this.dy;

        this.draw(context);
    }

    // Método para detectar si hay contacto (Distancia euclidiana)
    checkCollision(other) {
        let distanceX = this.posX - other.posX;
        let distanceY = this.posY - other.posY;
        let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        return distance < (this.radius + other.radius);
    }

    // Método para resolver el rebote (Intercambio de vectores)
    resolveCollision(other) {
        // Intercambiamos las velocidades para simular el rebote en dirección contraria
        const tempDx = this.dx;
        const tempDy = this.dy;

        this.dx = other.dx;
        this.dy = other.dy;

        other.dx = tempDx;
        other.dy = tempDy;

        // "Separación" mínima para evitar que los círculos se queden pegados
        this.posX += this.dx;
        this.posY += this.dy;
    }
}

let circles = [];

function generateCircles(n) {
    for (let i = 0; i < n; i++) {
        let radius = Math.random() * 15 + 15; // Un poco más pequeños para evitar amontonamiento
        let x = Math.random() * (window_width - radius * 2) + radius;
        let y = Math.random() * (window_height - radius * 2) + radius;
        
        let randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
        let speed = Math.random() * 4 + 1; // Velocidad entre 1 y 5
        
        circles.push(new Circle(x, y, radius, randomColor, `C${i + 1}`, speed));
    }
}

function animate() {
    ctx.clearRect(0, 0, window_width, window_height);
    circles.forEach(circle => {
        circle.update(ctx, circles); 
    });
    requestAnimationFrame(animate);
}

generateCircles(20);
animate();