const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const window_height = window.innerHeight;
const window_width = window.innerWidth;

canvas.height = window_height;
canvas.width = window_width;

// Fondo oscuro para resaltar los colores
canvas.style.background = "#121212"; 

class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.originalColor = color; 
        this.color = color;         
        this.text = text;
        this.speed = speed;

        this.dx = (Math.random() < 0.5 ? 1 : -1) * this.speed;
        this.dy = (Math.random() < 0.5 ? 1 : -1) * this.speed;
    }

    draw(context) {
        context.beginPath();
        // Usamos el color actual (puede ser el original o azul en colisión)
        context.strokeStyle = this.color;
        context.fillStyle = this.color; 
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "bold 14px Arial";
        
        // Dibujamos el texto con un poco de sombra para legibilidad
        context.fillText(this.text, this.posX, this.posY);

        context.lineWidth = 4; // Línea un poco más gruesa para el fondo oscuro
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();
    }

    update(context, allCircles) {
        let isCollidingNow = false;

        for (let other of allCircles) {
            if (this === other) continue; 

            if (this.checkCollision(other)) {
                isCollidingNow = true;
                this.resolveCollision(other); 
            }
        }

        // Efecto Flash Azul Neón
        this.color = isCollidingNow ? "#00D1FF" : this.originalColor;

        if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
            this.dx = -this.dx;
        }
        if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
            this.dy = -this.dy;
        }

        this.posX += this.dx;
        this.posY += this.dy;

        this.draw(context);
    }

    checkCollision(other) {
        let distanceX = this.posX - other.posX;
        let distanceY = this.posY - other.posY;
        let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        return distance < (this.radius + other.radius);
    }

    resolveCollision(other) {
        const tempDx = this.dx;
        const tempDy = this.dy;

        this.dx = other.dx;
        this.dy = other.dy;

        other.dx = tempDx;
        other.dy = tempDy;

        // Separación instantánea para evitar solapamiento continuo
        this.posX += this.dx;
        this.posY += this.dy;
    }
}

let circles = [];

function generateCircles(n) {
    for (let i = 0; i < n; i++) {
        let radius = Math.random() * 15 + 15;
        let x = Math.random() * (window_width - radius * 2) + radius;
        let y = Math.random() * (window_height - radius * 2) + radius;
        
        // Generamos colores vibrantes evitando los demasiado oscuros
        let randomColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
        let speed = Math.random() * 4 + 1; 
        
        circles.push(new Circle(x, y, radius, randomColor, `C${i + 1}`, speed));
    }
}

function animate() {
    // Rastro ligero opcional: usa un fillRect con opacidad en lugar de clearRect
    // para un efecto de "estela", pero por ahora mantenemos la limpieza total:
    ctx.clearRect(0, 0, window_width, window_height);
    circles.forEach(circle => {
        circle.update(ctx, circles); 
    });
    requestAnimationFrame(animate);
}

generateCircles(20);
animate();