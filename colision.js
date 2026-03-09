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
        this.originalColor = color; // Guardamos el color original
        this.color = color;         // Color actual (puede cambiar)
        this.text = text;
        this.speed = speed;

        this.dx = (Math.random() < 0.5 ? 1 : -1) * this.speed;
        this.dy = (Math.random() < 0.5 ? 1 : -1) * this.speed;
    }

    draw(context) {
        context.beginPath();
        context.strokeStyle = this.color;
        context.fillStyle = this.color; // Relleno opcional para ver mejor la colisión
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "bold 14px Arial";
        
        // Dibujar texto
        context.fillText(this.text, this.posX, this.posY);

        // Dibujar círculo
        context.lineWidth = 3;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();
    }

    update(context, allCircles) {
        this.draw(context);

        // Detectar colisiones con otros círculos
        let colliding = false;
        for (let other of allCircles) {
            if (this === other) continue; // No compararse consigo mismo

            if (this.isColliding(other)) {
                colliding = true;
                break; // Si choca con al menos uno, ya es azul
            }
        }

        // Cambiar color según estado de colisión
        this.color = colliding ? "#0000FF" : this.originalColor;

        // Rebote en bordes X
        if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
            this.dx = -this.dx;
        }

        // Rebote en bordes Y
        if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
            this.dy = -this.dy;
        }

        this.posX += this.dx;
        this.posY += this.dy;
    }

    // Método basado en la fórmula de distancia
    isColliding(other) {
        let distanceX = this.posX - other.posX;
        let distanceY = this.posY - other.posY;
        // Teorema de Pitágoras: a^2 + b^2 = c^2
        let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        return distance < (this.radius + other.radius);
    }
}

let circles = [];

function generateCircles(n) {
    for (let i = 0; i < n; i++) {
        let radius = Math.random() * 20 + 20; // Radio entre 20 y 40
        let x = Math.random() * (window_width - radius * 2) + radius;
        let y = Math.random() * (window_height - radius * 2) + radius;
        
        // Color aleatorio robusto
        let randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
        let speed = Math.random() * 4 + 1; // Velocidad entre 1 y 5
        
        circles.push(new Circle(x, y, radius, randomColor, `C${i + 1}`, speed));
    }
}

function animate() {
    ctx.clearRect(0, 0, window_width, window_height);
    circles.forEach(circle => {
        circle.update(ctx, circles); // Pasamos el array de círculos para detectar colisiones
    });
    requestAnimationFrame(animate);
}

generateCircles(20); // 20 círculos como solicitaste
animate();