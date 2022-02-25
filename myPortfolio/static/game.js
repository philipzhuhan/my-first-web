let vpWidth = window.innerWidth;
let vpHeight = window.innerHeight;
const canvasW = vpWidth;
const canvasH = vpHeight;
let canvas, ctx;
let map = new Image();


let fps, fpsInterval, startTime, now, then, elapsed;

function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    canvas = document.createElement("canvas");
    canvas.style.margin = 0;
    ctx = canvas.getContext("2d");
    document.body.insertBefore(canvas, document.body.childNodes[0]);
    map.src = "static/img/stars-6170172_1280.png";
    adjustCanvasSize();
    // map.width = vpWidth;
    // map.height = vpHeight;
    // objects.push(map);
    // player.width = vpWidth * 0.05;
    // player.height = player.width / player.src.srcFrameW * player.src.srcFrameH;
    // objects.push(player);
    // initMobs();

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    // calc elapsed time since last loop
    now = Date.now();
    elapsed = now - then;
    // if enough time has elapsed, draw the next frame
    if (elapsed > fpsInterval) {
        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        then = now - (elapsed % fpsInterval);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        adjustCanvasSize();
        ctx.imageSmoothingEnabled = false;
        drawBackground()
    }
}

function adjustCanvasSize() {
    var originW = canvas.width;
    vpWidth = window.innerWidth;
    vpHeight = window.innerHeight;

    // canvas should be canvasW * canvasH scale
    if (vpWidth / vpHeight <= canvasW / canvasH) {
        canvas.width = vpWidth;
        canvas.height = canvas.width * canvasH / canvasW;
    } else {
        canvas.height = vpHeight;
        canvas.width = canvas.height * canvasW / canvasH;
    }
    // var factor = canvas.width / originW;
}

function drawBackground() {
    ctx.drawImage(map, 0, 0, canvas.width, canvas.height);
}