const canvas = document.getElementById("ocean");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}
resize();
window.addEventListener("resize", resize);

/* ---------------------------
   BACKGROUND PARTICLES (OCEAN STARS)
----------------------------*/
const particles = [];

for (let i = 0; i < 400; i++) {
    particles.push({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        r: Math.random() * 1.8,
        v: 0.1 + Math.random() * 0.6
    });
}

/* ---------------------------
   FAKE FULLER PROJECTION GRID
----------------------------*/
const gridStep = 40;
let scrollOffset = 0;

// Continent "centers" in pseudo-projection space
const continents = [
    { name: "North America", x: 0.2, y: 0.35, color: "#4cc9f0" },
    { name: "South America", x: 0.28, y: 0.65, color: "#80ffdb" },
    { name: "Europe", x: 0.52, y: 0.30, color: "#ffd166" },
    { name: "Africa", x: 0.52, y: 0.55, color: "#ef476f" },
    { name: "Asia", x: 0.72, y: 0.40, color: "#a29bfe" },
    { name: "Australia", x: 0.80, y: 0.70, color: "#06d6a0" }
];

/* ---------------------------
   SCROLL CONTROLS (ROTATION FEEL)
----------------------------*/
window.addEventListener("wheel", (e) => {
    scrollOffset += e.deltaY * 0.0015;
});

/* ---------------------------
   SIMPLE WAVE FUNCTION
----------------------------*/
function wave(x, y, t) {
    return Math.sin(x * 0.01 + t) * Math.cos(y * 0.01 + t) * 6;
}

/* ---------------------------
   DRAW CONTINENTS
----------------------------*/
function drawContinents(time) {
    continents.forEach(c => {
        const x = c.x * canvas.width + Math.sin(time * 0.0008 + c.x * 10) * 20;
        const y = c.y * canvas.height + Math.cos(time * 0.0008 + c.y * 10) * 20;

        // glow
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.fillStyle = c.color + "55";
        ctx.fill();

        // core
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = c.color;
        ctx.fill();

        // label
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.font = "12px sans-serif";
        ctx.fillText(c.name, x + 10, y - 10);
    });
}

/* ---------------------------
   DRAW GRID (FULLER-LIKE ILLUSION)
----------------------------*/
function drawGrid(time) {
    const offset = scrollOffset * 100;

    ctx.strokeStyle = "rgba(120,180,255,0.08)";
    ctx.lineWidth = 1;

    for (let x = -gridStep; x < canvas.width + gridStep; x += gridStep) {
        ctx.beginPath();

        for (let y = 0; y < canvas.height; y += 10) {
            const wx = x + wave(x, y + offset, time * 0.001);
            const wy = y + wave(x, y + offset, time * 0.001);

            if (y === 0) ctx.moveTo(wx, wy);
            else ctx.lineTo(wx, wy);
        }

        ctx.stroke();
    }
}

/* ---------------------------
   MAIN ANIMATION LOOP
----------------------------*/
function animate(time) {
    ctx.fillStyle = "#020812";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* stars / ocean particles */
    particles.forEach(p => {
        p.x += p.v;

        if (p.x > canvas.width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(120,180,255,0.6)";
        ctx.fill();
    });

    /* grid ocean */
    drawGrid(time);

    /* continents */
    drawContinents(time);

    requestAnimationFrame(animate);
}

animate(0);
