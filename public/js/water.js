const canvas = document.getElementById("ocean");
const ctx = canvas.getContext("2d");

function resize(){
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}
resize();
window.addEventListener("resize", resize);

const particles=[];

for(let i=0;i<500;i++){
    particles.push({
        x:Math.random()*canvas.width,
        y:Math.random()*canvas.height,
        r:Math.random()*2,
        v:0.2+Math.random()*0.8
    });
}

function animate(){

    ctx.fillStyle="#020812";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    particles.forEach(p=>{

        p.x += p.v;

        if(p.x>canvas.width){
            p.x=0;
        }

        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);

        ctx.fillStyle="rgba(120,180,255,0.7)";
        ctx.fill();
    });

    requestAnimationFrame(animate);
}

animate();
