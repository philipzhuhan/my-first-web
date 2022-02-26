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

        // player game attribute
        this.lvl = 1;
        this.maxHp = this.lvl * 100 + 50;
        this.maxMp = this.lvl * 50 + 50;
        this.curHp = this.maxHp;
        this.curMp = this.maxMp;
        this.maxExp = this.lvl * 50 + 10;
        this.curExp = 0;
        this.atk = this.lvl * 30 + 20;
        this.def = this.lvl * 15 + 15;
        this.gold = 0;
        this.inv = [];
        this.moving = false;
        this.speed = this.width / 2;
        // in battle
        this.inBattle = false;
        this.isAlive = true;
        this.isAttacking = false;

        this.hpBarX = this.x;
        this.hpBarY = this.y + this.height;
        this.hpBarW = this.width;
        this.hpBarH = this.height * 0.1;
        this.curHpBarW = this.curHp / this.maxHp * this.hpBarW;
        this.mpBarX = this.x;
        this.mpBarY = this.hpBarY + this.hpBarH;
        this.mpBarW = this.width;
        this.mpBarH = this.height * 0.1;
        this.curMpBarW = this.curMp / this.maxMp * this.mpBarW;
    }

    scale(factor) {
        this.x *= factor;
        this.y *= factor;
        this.width *= factor;
        this.height *= factor;
        this.speed = this.width / 2;

        this.hpBarX = this.x;
        this.hpBarY = this.y + this.height;
        this.hpBarW = this.width;
        this.hpBarH = this.height * 0.1;
        this.curHpBarW = this.curHp / this.maxHp * this.hpBarW;
        this.mpBarX = this.x;
        this.mpBarY = this.hpBarY + this.hpBarH;
        this.mpBarW = this.width;
        this.mpBarH = this.height * 0.1;
        this.curMpBarW = this.curMp / this.maxMp * this.mpBarW;
    }

    draw(ctx) {
        var srcX = this.srcX + this.srcFrameW * this.frameX;
        var srcY = this.srcY + this.srcFrameH * this.frameY;
        ctx.drawImage(this.sprite, srcX, srcY, this.srcFrameW, this.srcFrameH, this.x, this.y, this.width, this.height);
        // console.log('draw player: ' + srcX + ' ' + srcY + ' ' + this.srcFrameW + ' ' + this.srcFrameH + ' ' + this.x + ' ' + this.y + ' ' + this.width + ' ' + this.height);
        // draw hp bar
        ctx.fillStyle = '#808080';
        ctx.fillRect(this.hpBarX, this.hpBarY, this.hpBarW, this.hpBarH);
        if (this.curHp > this.maxHp * 0.3) {
            ctx.fillStyle = '#00ff00';
        } else {
            ctx.fillStyle = '#ff0000';
        }
        ctx.fillRect(this.hpBarX, this.hpBarY, this.curHpBarW, this.hpBarH);
        // draw mp bar
        ctx.fillStyle = '#808080';
        ctx.fillRect(this.mpBarX, this.mpBarY, this.mpBarW, this.mpBarH);
        ctx.fillStyle = '#0019ff';
        ctx.fillRect(this.mpBarX, this.mpBarY, this.curMpBarW, this.mpBarH);
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

        this.hpBarX = this.x;
        this.hpBarY = this.y + this.height;
        this.hpBarW = this.width;
        this.hpBarH = this.height * 0.1;
        this.curHpBarW = this.curHp / this.maxHp * this.hpBarW;
        this.mpBarX = this.x;
        this.mpBarY = this.hpBarY + this.hpBarH;
        this.mpBarW = this.width;
        this.mpBarH = this.height * 0.1;
        this.curMpBarW = this.curMp / this.maxMp * this.mpBarW;
    }
}

class Mob {
    constructor(x, y, width, direction, lvl) {
        this.sprite = new Image();
        this.sprite.src = "static/img/SlimeSprite.png";
        this.srcFrameW = 31.25;
        this.srcFrameH = 30;
        this.srcX = 0;
        this.srcY = 4;
        this.frameX = 0;
        this.frameY = 0;
        this.initX = x;
        this.initY = y;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = this.width / this.srcFrameW * this.srcFrameH;
        this.moving = true;
        this.speed = this.width / 10;
        this.direction = direction;
        this.moveLimit = this.width * 2;

        // mob game attribute
        this.lvl = lvl;
        this.maxHp = this.lvl * 50 + 25;
        this.maxMp = this.lvl * 25 + 25;
        this.curHp = this.maxHp;
        this.curMp = this.maxMp;
        this.atk = this.lvl * 15 + 10;
        this.def = this.lvl * 10 + 5;

        // in battle
        this.inBattle = false;
        this.isAlive = true;
        this.isAttacking = false;

        this.hpBarX = this.x;
        this.hpBarY = this.y + this.height;
        this.hpBarW = this.width;
        this.hpBarH = this.height * 0.1;
        this.curHpBarW = this.curHp / this.maxHp * this.hpBarW;
        this.mpBarX = this.x;
        this.mpBarY = this.hpBarY + this.hpBarH;
        this.mpBarW = this.width;
        this.mpBarH = this.height * 0.1;
        this.curMpBarW = this.curMp / this.maxMp * this.mpBarW;
    }

    scale(factor) {
        this.x *= factor;
        this.y *= factor;
        this.width *= factor;
        this.height *= factor;
        this.speed = this.width / 10;

        this.initX *= factor;
        this.initY *= factor;
        this.moveLimit = this.width * 2;

        this.hpBarX = this.x;
        this.hpBarY = this.y + this.height;
        this.hpBarW = this.width;
        this.hpBarH = this.height * 0.1;
        this.curHpBarW = this.curHp / this.maxHp * this.hpBarW;
        this.mpBarX = this.x;
        this.mpBarY = this.hpBarY + this.hpBarH;
        this.mpBarW = this.width;
        this.mpBarH = this.height * 0.1;
        this.curMpBarW = this.curMp / this.maxMp * this.mpBarW;
    }

    draw(ctx) {
        var srcX = this.srcX + this.srcFrameW * this.frameX;
        var srcY = this.srcY + this.srcFrameH * this.frameY;
        ctx.drawImage(this.sprite, srcX, srcY, this.srcFrameW, this.srcFrameH, this.x, this.y, this.width, this.height);
        // draw hp bar
        ctx.fillStyle = '#808080';
        ctx.fillRect(this.hpBarX, this.hpBarY, this.hpBarW, this.hpBarH);
        if (this.curHp > this.maxHp * 0.3) {
            ctx.fillStyle = '#00ff00';
        } else {
            ctx.fillStyle = '#ff0000';
        }
        ctx.fillRect(this.hpBarX, this.hpBarY, this.curHpBarW, this.hpBarH);
        // draw mp bar
        ctx.fillStyle = '#808080';
        ctx.fillRect(this.mpBarX, this.mpBarY, this.mpBarW, this.mpBarH);
        ctx.fillStyle = '#0019ff';
        ctx.fillRect(this.mpBarX, this.mpBarY, this.curMpBarW, this.mpBarH);
    }

    move() {
        if (this.direction === "down") {
            if (this.y >= this.initY + this.moveLimit || this.y >= canvas.height - this.height) {
                // console.log("turn right");
                this.direction = "right";
                this.frameY = 1;
            } else {
                this.y += this.speed;
                // console.log("move down");
            }
        }

        if (this.direction === "right") {
            if (this.x >= this.initX + this.moveLimit || this.x >= canvas.width - this.width) {
                // console.log("turn up");
                this.direction = "up";
                this.frameY = 2;
            } else {
                this.x += this.speed;
                // console.log("move right");
            }
        }

        if (this.direction === "up") {
            if (this.y <= this.initY - this.moveLimit || this.y <= 0) {
                // console.log("turn left");
                this.direction = "left";
                this.frameY = 0;
            } else {
                this.y -= this.speed;
                // console.log("move up");
            }
        }

        if (this.direction === "left") {
            if (this.x < this.initX - this.moveLimit || this.x <= 0) {
                // console.log("turn down");
                this.direction = "down";
                this.frameY = 2;
            } else {
                this.x -= this.speed;
            }
        }

        if (this.frameX < 7 && this.moving) this.frameX++
            else this.frameX = 0;

        this.hpBarX = this.x;
        this.hpBarY = this.y + this.height;
        this.hpBarW = this.width;
        this.hpBarH = this.height * 0.1;
        this.curHpBarW = this.curHp / this.maxHp * this.hpBarW;
        this.mpBarX = this.x;
        this.mpBarY = this.hpBarY + this.hpBarH;
        this.mpBarW = this.width;
        this.mpBarH = this.height * 0.1;
        this.curMpBarW = this.curMp / this.maxMp * this.mpBarW;
    }
}

let fps, fpsInterval, startTime, now, then, elapsed;
let player;
let gameStates = ['Explore', 'Battle'];
let curGameState = gameStates[0];
let keys = [];
let mobs = [];
let mobNum = 3;
let mapLvl = 1;
const mobDirs = ["up", "right", "down", "left"];

function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    canvas = document.createElement("canvas");
    canvas.style.margin = 0;
    canvas.width = vpWidth;
    canvas.height = vpHeight;
    ctx = canvas.getContext("2d");
    document.body.insertBefore(canvas, document.body.childNodes[0]);
    map.src = "static/img/stars-6170172_1280.png";
    player = new Player(canvas.width, canvas.height);
    initMobs();
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
        for (i = 0; i < mobs.length; i++) {
            mobs[i].move();
            mobs[i].draw(ctx);
            if (distance(player, mobs[i]) <= player.width + mobs[i].width) {
                console.log("player encountered mob " + i);
            }
        }
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
    for (i = 0; i < mobs.length; i++) {
        mobs[i].scale(factor);
    }
}

function drawBackground() {
    ctx.drawImage(map, 0, 0, canvas.width, canvas.height);
}

function initMobs() {
    for (i = 0; i < mobNum; i++) {
        var mobX = Math.random() * (canvas.width * 0.95); //size of mob should be 5% of canvas size
        var mobY = Math.random() * (canvas.height * 0.95); //size of mob should be 5% of canvas size
        var initDir = mobDirs[Math.floor(Math.random() * mobDirs.length)];
        var lvl = Math.ceil(Math.random() * 5) + 5 * (mapLvl - 1);
        var mobW = canvas.width * 0.05;
        var mob = new Mob(mobX, mobY, mobW, initDir, lvl);
        while (distance(player, mob) <= player.width / 2 + mob.width / 2) {
            mobX = Math.random() * (canvas.width * 0.95);
            mobY = Math.random() * (canvas.height * 0.95);
            initDir = mobDirs[Math.floor(Math.random() * mobDirs.length)];
            lvl = Math.ceil(Math.random() * 5) + 5 * (mapLvl - 1);
            mob = new Mob(mobX, mobY, mobW, initDir, lvl);
        }
        mobs.push(mob);
    }
}

function distance(objA, objB) {
    return Math.sqrt(((objA.x + objA.width / 2) - (objB.x + objB.width / 2)) ** 2 + ((objA.y + objA.height / 2) - (objB.y + objB.height / 2)) ** 2);
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
})

window.addEventListener("touchstart", function(e) {
    e.preventDefault();
    if (curGameState === 'Explore') {
        var touch = e.touches[0];
        var firstTouchX = touch.pageX;
        var firstTouchY = touch.pageY;

        this.window.addEventListener("touchmove", function() {
            var moveX = touch.pageX - firstTouchX;
            var moveY = touch.pageY - firstTouchY;
            if (moveX > 0) {
                keys["ArrorRight"] = true;
                player.move = true;
            }
            if (moveX < 0) {
                keys["ArrorLeft"] = true;
                player.move = true;
            }
            if (moveY > 0) {
                keys["ArrorDown"] = true;
                player.move = true;
            }
            if (moveY < 0) {
                keys["ArrorUp"] = true;
                player.move = true;
            }
        })
    }
})

window.addEventListener("touchend", function(e) {
    if (curGameState === 'Explore') {
        for (const key of keys) {
            key = false;
        }
        player.moving = false;
    }
})