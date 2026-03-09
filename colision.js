// Selecciona el elemento canvas del DOM mediante su ID
const canvas = document.getElementById("canvas"); 
// Define el contexto de dibujo en 2D, que es la "brocha" para pintar en el canvas
let ctx = canvas.getContext("2d"); 

// Almacena el alto de la ventana del navegador en una constante
const window_height = window.innerHeight; 
// Almacena el ancho de la ventana del navegador en una constante
const window_width = window.innerWidth; 

// Asigna el alto de la ventana al alto del canvas para que ocupe toda la pantalla
canvas.height = window_height; 
// Asigna el ancho de la ventana al ancho del canvas
canvas.width = window_width; 

// Establece un color de fondo oscuro (Gris casi negro) para que los colores resalten
canvas.style.background = "#121212"; 

/**
 * Clase Circle: Define las propiedades y comportamientos de cada círculo
 */
class Circle { 
    constructor(x, y, radius, color, text, speed) { 
        this.posX = x;      // Posición horizontal inicial
        this.posY = y;      // Posición vertical inicial
        this.radius = radius; // Tamaño del círculo
        this.originalColor = color; // Guarda el color base para volver a él tras chocar
        this.color = color;         // Color actual que se renderiza
        this.text = text;           // Etiqueta (C1, C2, etc.)
        this.speed = speed;         // Magnitud de la velocidad inicial

        // Determina la dirección inicial (dx, dy). Math.random < 0.5 da dirección negativa o positiva
        this.dx = (Math.random() < 0.5 ? 1 : -1) * this.speed; 
        this.dy = (Math.random() < 0.5 ? 1 : -1) * this.speed; 
    } 

    // Método encargado de renderizar el círculo en el canvas
    draw(context) { 
        context.beginPath(); // Inicia una nueva ruta de dibujo
        
        context.strokeStyle = this.color; // Define el color del borde
        context.fillStyle = this.color;   // Define el color del texto y relleno
        context.textAlign = "center";     // Centra el texto horizontalmente
        context.textBaseline = "middle";  // Centra el texto verticalmente
        context.font = "bold 15px Arial"; // Estilo de la fuente
        
        // Dibuja el texto en las coordenadas actuales del círculo
        context.fillText(this.text, this.posX, this.posY); 
        
        context.lineWidth = 4; // Grosor del borde del círculo
        // Crea el arco (círculo completo de 0 a 2*PI radianes)
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false); 
        context.stroke(); // Dibuja la línea del borde
        context.closePath(); // Cierra la ruta de dibujo
    } 

    // Método que gestiona el movimiento y la lógica de colisión
    update(context, allCircles) { 
        let isCollidingNow = false; // Bandera para saber si el círculo está tocando a otro

        // Bucle para comparar este círculo contra todos los demás en el array
        for (let other of allCircles) { 
            if (this === other) continue; // Salta la comparación si es el mismo objeto

            // Si el método checkCollision devuelve true, hay impacto
            if (this.checkCollision(other)) { 
                isCollidingNow = true;      // Activamos el estado de colisión
                this.resolveCollision(other); // Aplicamos la física de rebote
            } 
        } 

        // Si hay colisión cambia a Cian brillante (#00D1FF), si no, vuelve a su color original
        this.color = isCollidingNow ? "#00D1FF" : this.originalColor; 

        // Rebote en bordes horizontales: si toca izquierda o derecha, invierte dx
        if (this.posX + this.radius > window_width || this.posX - this.radius < 0) { 
            this.dx = -this.dx; 
        } 
        
        // Rebote en bordes verticales: si toca arriba o abajo, invierte dy
        if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
            this.dy = -this.dy; 
        } 

        // Suma la velocidad a la posición actual para crear movimiento
        this.posX += this.dx; 
        this.posY += this.dy; 

        // Llama al método draw para pintar el círculo en su nueva posición
        this.draw(context); 
    } 

    // Calcula la distancia entre centros usando el Teorema de Pitágoras
    checkCollision(other) {
        let distanceX = this.posX - other.posX;
        let distanceY = this.posY - other.posY;
        // Fórmula: distancia = raíz cuadrada de (diffX² + diffY²)
        let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        // Si la distancia es menor a la suma de los radios, los círculos se solapan
        return distance < (this.radius + other.radius);
    }

    // Intercambia las velocidades para simular el efecto de rebote elástico
    resolveCollision(other) {
        const tempDx = this.dx;
        const tempDy = this.dy;

        // El círculo A toma la velocidad del círculo B y viceversa
        this.dx = other.dx;
        this.dy = other.dy;
        other.dx = tempDx;
        other.dy = tempDy;

        // Pequeño ajuste de posición para evitar que se queden "pegados" por solapamiento
        this.posX += this.dx;
        this.posY += this.dy;
    }
} 

// Array vacío donde guardaremos las instancias de la clase Circle
let circles = []; 

/**
 * Función para poblar el array con N círculos aleatorios
 */
function generateCircles(n) { 
    for (let i = 0; i < n; i++) { 
        let radius = Math.random() * 15 + 15; // Radio aleatorio entre 15 y 30
        // Posición X e Y aleatoria, restando el radio para que no aparezcan fuera del borde
        let x = Math.random() * (window_width - radius * 2) + radius; 
        let y = Math.random() * (window_height - radius * 2) + radius; 
        // Genera colores usando HSL para que sean vibrantes y no oscuros
        let color = `hsl(${Math.random() * 360}, 80%, 60%)`; 
        let speed = Math.random() * 4 + 1; // Velocidad aleatoria entre 1 y 5
        let text = `C${i + 1}`; // Etiqueta identificadora
        
        // Crea una nueva instancia y la añade al array
        circles.push(new Circle(x, y, radius, color, text, speed)); 
    } 
} 

/**
 * Función principal de animación que se ejecuta a ~60 cuadros por segundo
 */
function animate() { 
    // Borra todo el canvas antes de dibujar el siguiente cuadro (limpia rastros)
    ctx.clearRect(0, 0, window_width, window_height); 
    
    // Itera el array y actualiza cada círculo
    circles.forEach(circle => { 
        circle.update(ctx, circles); 
    }); 
    
    // Función de JS que le dice al navegador que queremos realizar una animación
    requestAnimationFrame(animate); 
} 

// Ejecución inicial: Genera 20 círculos y arranca el ciclo de animación
generateCircles(20); 
animate();