const canvas = document.getElementById("ocean");
const ctx = canvas.getContext("2d");

const uiTabs = document.getElementById("tabs");
const title = document.getElementById("title");

function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}
resize();
window.addEventListener("resize", resize);

/* -----------------------------
   SCROLL WORLD STATE
------------------------------*/
let scroll = 0;
window.addEventListener("wheel", e => {
    scroll += e.deltaY * 0.0015;
});

/* -----------------------------
   CONTINENT DATA (lat/lon)
------------------------------*/
const continents = [
    {
        name: "North America",
        color: "#4cc9f0",
        lat: 40, lon: -100,
        tabs: ["Contact", "Research", "About Me"]
    },
    {
        name: "South America",
        color: "#80ffdb",
        lat: -15, lon: -60,
        tabs: ["Overview", "Projects", "Contact"]
    },
    {
        name: "Europe",
        color: "#ffd166",
        lat: 50, lon: 10,
        tabs: ["History", "Research", "Contact"]
    },
    {
        name: "Africa",
        color: "#ef476f",
        lat: 5, lon: 20,
        tabs: ["Field Work", "Contact", "About"]
    },
    {
        name: "Asia",
        color: "#a29bfe",
        lat: 30, lon: 100,
        tabs: ["Labs", "Research", "Contact"]
    },
    {
        name: "Australia",
        color: "#06d6a0",
        lat: -25, lon: 135,
        tabs: ["Bio", "Projects", "Contact"]
    }
];

/* -----------------------------
   SIMPLE SPHERE -> 3D
------------------------------*/
function toRad(d) {
    return d * Math.PI / 180;
}

function sphereTo3D(lat, lon) {
    const latR = toRad(lat);
    const lonR = toRad(lon);

    return {
        x: Math.cos(latR) * Math.cos(lonR),
        y: Math.sin(latR),
        z: Math.cos(latR) * Math.sin(lonR)
    };
}

/* -----------------------------
   DYMAXION-LIKE 2D PROJECTION
   (simplified icosa-style flattening)
------------------------------*/
function projectDymaxion(v) {
    // rotate globe slowly for scroll effect
    const angle = scroll;

    const x = v.x * Math.cos(angle) - v.z * Math.sin(angle);
    const z = v.x * Math.sin(angle) + v.z * Math.cos(angle);

    return {
        x: (x + 1) * 0.5 * canvas.width,
        y: (v.y + 1) * 0.5 * canvas.height,
        z
    };
}

/* -----------------------------
   WAVES
------------------------------*/
function wave(x, y, t) {
    return Math.sin(x * 0.01 + t) * Math.cos(y * 0.01 + t) * 6;
}

/* -----------------------------
   UI STATE
------------------------------*/
let activeContinent = null;

function renderTabs() {
    uiTabs.innerHTML = "";

    if (!activeContinent) {
        title.textContent = "Click a continent";
        return;
    }

    title.textContent = activeContinent.name;

    activeContinent.tabs.forEach(tab => {
        const div = document.createElement("div");
        div.className = "tab";
        div.textContent = tab;

        div.onclick = () => {
            alert(`${tab} → ${activeContinent.name}`);
        };

        uiTabs.appendChild(div);
    });
}

/* -----------------------------
   DRAW LOOP
------------------------------*/
function animate(t) {
    ctx.fillStyle = "#020812";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    continents.forEach(c => {
        const sphere = sphereTo3D(c.lat, c.lon);
        const p = projectDymaxion(sphere);

        const wobble = wave(p.x, p.y, t * 0.001);

        const x = p.x + wobble;
        const y = p.y + wobble;

        // glow
        ctx.beginPath();
        ctx.arc(x, y, 22, 0, Math.PI * 2);
        ctx.fillStyle = c.color + "33";
        ctx.fill();

        // core
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = c.color;
        ctx.fill();

        // label
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.font = "12px sans-serif";
        ctx.fillText(c.name, x + 10, y - 10);

        // click detection zone (simple)
        c._x = x;
        c._y = y;
    });

    renderTabs();
    requestAnimationFrame(animate);
}

/* -----------------------------
   CLICK CONTINENTS
------------------------------*/
canvas.addEventListener("click", (e) => {
    const mx = e.clientX;
    const my = e.clientY;

    activeContinent = continents.find(c => {
        const dx = c._x - mx;
        const dy = c._y - my;
        return Math.sqrt(dx * dx + dy * dy) < 25;
    }) || null;
});

animate();
