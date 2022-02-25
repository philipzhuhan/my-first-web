let vpWidth = window.innerWidth;
let vpHeight = window.innerHeight;
const canvasW = vpWidth;
const canvasH = vpHeight;
let canvas, ctx;
let map = new Image();

class Player {
    constructor(canvasW, canvasH) {
        this.sprite = new Image();
        this.sprite.src = "static/img/PlayerSpriteSheet.png";
        // this.srcW = 600;
        // this.srcH = 600
        this.srcFrameW = 115;
        this.srcFrameH = 150;
        this.srcX = 70;
        this.srcY = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.x = canvasW / 2;
        this.y = canvasH / 2;
        this.width = canvasW * 0.05;
        this.height = this.width / this.srcFrameW * this.srcFrameH;
        this.moving = false;
        this.speed = this.width / 2;
    }

    scale(factor) {
        this.x *= factor;
        this.y *= factor;
        this.width *= factor;
        this.height *= factor;
        this.speed = this.width / 2;
    }

    draw(ctx) {
        var srcX = this.srcX + this.srcFrameW * this.frameX;
        var srcY = this.srcY + this.srcFrameH * this.frameY;
        ctx.drawImage(this.sprite, srcX, srcY, this.srcFrameW, this.srcFrameH, this.x, this.y, this.width, this.height);
        // console.log('draw player: ' + srcX + ' ' + srcY + ' ' + this.srcFrameW + ' ' + this.srcFrameH + ' ' + this.x + ' ' + this.y + ' ' + this.width + ' ' + this.height);
    }

    move() {
        if (keys["ArrowUp"] && this.y > 0) {
            // move up
            this.y -= this.speed;
            this.frameY = 3;
        }

        if (keys["ArrowLeft"] && this.x > 0) {
            // move left
            this.x -= this.speed;
            this.frameY = 2;
        }

        if (keys["ArrowDown"] && this.y < canvas.height - this.height * 1.2) {
            // move down
            this.y += this.speed;
            this.frameY = 0;
        }

        if (keys["ArrowRight"] && this.x < canvas.width - this.width) {
            // move right
            this.x += this.speed;
            this.frameY = 1;
        }

        if (this.frameX < 3 && this.moving) this.frameX++
            else this.frameX = 0;
    }
}

let fps, fpsInterval, startTime, now, then, elapsed;
let player;
let gameStates = ['Explore', 'Battle'];
let curGameState = gameStates[0];
let keys = [];

function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    canvas = document.createElement("canvas");
    canvas.style.margin = 0;
    ctx = canvas.getContext("2d");
    document.body.insertBefore(canvas, document.body.childNodes[0]);
    map.src = "static/img/stars-6170172_1280.png";
    player = new Player(canvas.width, canvas.height);
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
        player.move();
        drawBackground();
        player.draw(ctx);
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
    var factor = canvas.width / originW;
    player.scale(factor);
}

function drawBackground() {
    ctx.drawImage(map, 0, 0, canvas.width, canvas.height);
}

window.addEventListener("keydown", function(e) {
    if (curGameState === 'Explore') {
        keys[e.key] = true;
        player.moving = true;
    }
})

window.addEventListener("keyup", function(e) {
    if (curGameState === 'Explore') {
        keys[e.key] = false;
        player.moving = false;
    }
    // console.log(keys);
})