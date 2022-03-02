let vpWidth, vpHeight;
var screenOrientation = (screen.orientation || {}).type || screen.mozOrientation || screen.msOrientation;
let background = new Image();
let cursor = new Image();
// Map sources
const exploreMap = {
    src: "static/img/stars-6170172_1280.png",
    width: 1280,
    height: 853,
};
// Map sources
// const mapW = 1280;
// const mapH = 853;
const cursorImg = {
    src: "static/img/sword-cursor.png",
    width: 540,
    height: 540,
}

let touchArrow = new Image();
const touchArrowImg = {
    src: "static/img/touchArrow.png",
    width: 801,
    height: 610,
}
let touchDetected = false;
let touchRotateRadians;
let touchArrowW, touchArrowH;

let canvas, ctx;
const isMobile = ('ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/));

class Player {
    constructor(x, y, width, height) {
        this.id = -1;
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
        this.x = x;
        this.y = y;
        this.originX = this.x;
        this.originY = this.y;
        this.width = width;
        this.height = height;
        this.moving = false;
        this.speed = this.width / 3;

        // player game attribute
        this.name = '';
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
        this.speed = this.width / 3;

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

    changeOrientation(newOrientation, oldCanvasW, oldCanvasH, newCanvasW, newCanvasH) {
        var xPerc = this.x / oldCanvasW;
        var yPerc = this.y / oldCanvasH;

        this.x = newCanvasW * xPerc;
        this.y = newCanvasH * yPerc;

        if (newOrientation == 'portrait-primary' || screenOrientation == 'portrait-secondary') {
            this.height = newCanvasH * 0.05;
            this.width = this.height / this.srcFrameH * this.srcFrameW;
        } else {
            this.width = newCanvasW * 0.05;
            this.height = this.width / this.srcFrameW * this.srcFrameH;
        }

        this.speed = this.width / 3;

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
        if (curGameState === gameStates[0]) {
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

    engageBattle(x, y, width) {
        this.originX = this.x;
        this.originY = this.y;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = this.width / this.srcFrameW * this.srcFrameH;
        this.frameX = 0;
        this.frameY = 1;
        this.moving = true;
        this.speed = 0;
    }

    disEngageBattle(width) {
        this.x = this.originX;
        this.y = this.originY;
        this.width = width;
        this.height = this.width / this.srcFrameW * this.srcFrameH;
        this.moving = false;
        this.speed = this.width / 3;
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

    changeOrientation(newOrientation, oldCanvasW, oldCanvasH, newCanvasW, newCanvasH) {
        var xPerc = this.x / oldCanvasW;
        var yPerc = this.y / oldCanvasH;
        var originXPerc = this.initX / oldCanvasW;
        var originYPerc = this.initY / oldCanvasH

        this.x = newCanvasW * xPerc;
        this.y = newCanvasH * yPerc;
        this.initX = newCanvasW * originXPerc;
        this.initY = newCanvasH * originYPerc;

        if (newOrientation == 'portrait-primary' || screenOrientation == 'portrait-secondary') {
            this.height = newCanvasH * 0.05;
            this.width = this.height / this.srcFrameH * this.srcFrameW;
        } else {
            this.width = newCanvasW * 0.05;
            this.height = this.width / this.srcFrameW * this.srcFrameH;
        }

        this.speed = this.width / 10;
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
        if (curGameState === gameStates[0]) {
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

    engageBattle(x, y, width) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = this.width / this.srcFrameW * this.srcFrameH;
        this.frameX = 0;
        this.frameY = 0;
        this.moving = true;
        this.speed = 0;
    }

    disEngageBattle(width) {
        this.x = this.initX;
        this.y = this.initY;
        this.width = width;
        this.height = this.width / this.srcFrameW * this.srcFrameH;
        this.frameX = 0;
        this.frameY = 2;
        this.direction = "down";
        this.moving = true;
        this.speed = this.width / 10;
        this.moveLimit = this.width * 2;
    }
}

let fps, fpsInterval, startTime, now, then, elapsed;
let player;
let playerX, playerY, playerW, playerH;
let gameStates = ['Explore', 'Battle'];
let curGameState = gameStates[0];
let keys = [];
let mobs = [];
let mobNum = 3;
let mapLvl = 1;
const mobDirs = ["up", "right", "down", "left"];
var savedCharacters = [];
var battleMob;
const actions = ["Attack", "Magic", "Escape"];
let curActionIndex = 0;
let curAction = actions[curActionIndex];
let actionBoxX, actionBoxY, actionBoxW, actionBoxH;
let actionOptionBoxW, actionOptionBoxH
let actionBoxTxtSize, actionBoxTxtStyle, actionBoxTxtFontStyle;
let displayQn = false;
let qn = 'some question';
let ansOpts = [];
let ansOptIndex = 0;
let ansOptSelected = '';
let txtStyle = "Arial";
let indexOfAns = -1;
let qnX, qnY, qnBoxW, qnboxH, qnTxtX, qnTxtY, qnTxtSize, qnTxtFontStyle, qnOptW, qnOptH, optX, optY, optW, optH, optTxtSize, optTxtFontStyle, optTxtY;
let cursorX, cursorY, cursorW, cursorH;

function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    // initialize Canvas
    canvas = document.createElement("canvas");
    canvas.style.margin = 0;
    vpWidth = document.documentElement.clientWidth;
    vpHeight = document.documentElement.clientHeight;
    canvas.width = vpWidth;
    canvas.height = vpHeight;
    ctx = canvas.getContext("2d");
    document.body.insertBefore(canvas, document.body.childNodes[0]);
    background.src = exploreMap.src;
    cursor.src = cursorImg.src;
    touchArrow.src = touchArrowImg.src;
    if (screenOrientation == 'portrait-primary' || screenOrientation == 'portrait-secondary') {
        playerH = canvas.height * 0.05;
        playerW = playerH / 150 * 115;
    } else {
        playerW = canvas.width * 0.05;
        playerH = playerW / 115 * 150;
    }
    // initialize player
    player = new Player(canvas.width / 2, canvas.height / 2, playerW, playerH);
    // load from save if there's existing character saved
    retrieve_characters();
    if (savedCharacters.length > 0) {
        match_char_attributes(player, savedCharacters[0]);
    }
    // initialize mobs
    initMobs();
    // adjustView();
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
        // console.log(screenOrientation);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        adjustView();
        ctx.imageSmoothingEnabled = false;
        if (curGameState === gameStates[0]) {
            player.move();
            drawBackground();
            for (i = 0; i < mobs.length; i++) {
                mobs[i].move();
                mobs[i].draw(ctx);
                if (distance(player, mobs[i]) <= player.width / 2 + mobs[i].width / 2) {
                    // player encounter mob
                    battleMob = mobs[i];
                    mobs.splice(i, 1);
                    curGameState = gameStates[1];
                    curAction = actions[0];
                    initiate_action_box();
                    var playerW, playerX, playerY, mobX, mobY, mobW;
                    playerW = canvas.height / 4;
                    playerX = canvas.width / 4 - playerW / 2;
                    playerY = canvas.height / 3 - playerW / player.srcFrameW * player.srcFrameH / 2;
                    player.engageBattle(playerX, playerY, playerW);
                    mobW = canvas.height / 4;
                    mobX = canvas.width / 4 * 3 - mobW / 2;
                    mobY = canvas.height / 3 - mobW / battleMob.srcFrameW * battleMob.srcFrameH / 2;
                    battleMob.engageBattle(mobX, mobY, mobW);
                    console.log("engaging battle");
                }
            }
            player.draw(ctx);
            if (isMobile && touchDetected) {
                drawTouchArrow();
            }
        }
        if (curGameState === gameStates[1]) {
            drawBackground();
            drawActionsBox();
            drawCursor();
            player.move();
            battleMob.move();
            player.draw(ctx);
            battleMob.draw(ctx);
        }

    }
}

function initiate_action_box() {
    displayQn = false; // display action choices, not display questions
    curAction = actions[0]; // default action to point at first option
    // initiate Action box element dimentions
    actionBoxX = 0;
    actionBoxW = canvas.width;
    actionBoxH = canvas.height * 0.3;
    actionBoxY = canvas.height - actionBoxH;
    actionOptionBoxH = actionBoxH;
    actionOptionBoxW = canvas.width / actions.length;
    actionBoxTxtSize = Math.floor(actionOptionBoxH * 0.5);
    actionBoxTxtStyle = "Arial";
    actionBoxTxtFontStyle = actionBoxTxtSize + "px " + actionBoxTxtStyle;

    // initiate cursor
    cursorX = actionBoxX + actionOptionBoxW / 2;
    cursorY = actionBoxY + actionOptionBoxH / 2;
    cursorW = actionOptionBoxW / 3;
    cursorH = cursorW / cursorImg.width * cursorImg.height;
}

function drawActionsBox() {
    // draw action box
    ctx.fillStyle = "white";
    ctx.fillRect(actionBoxX, actionBoxY, canvas.width, actionBoxH);

    if (displayQn == true) {
        // draw question & options, place cursor on option 1
        // draw question
        ctx.fillStyle = "black";
        ctx.font = qnTxtFontStyle
        ctx.fillText(qn, qnTxtX, qnTxtY, qnBoxW);

        // draw options
        for (i = 0; i < ansOpts.length; i++) {
            if (i == ansOptIndex) {
                ctx.fillStyle = "yellow";
                ctx.fillRect(qnX + qnOptW * i, optY, qnOptW, qnOptH);
                ctx.beginPath();
            }
            ctx.lineWidth = "6";
            ctx.strokeStyle = "blue";
            ctx.rect(qnX + qnOptW * i, optY, qnOptW, qnOptH);
            ctx.stroke();
            ctx.fillStyle = "black";
            ctx.font = optTxtFontStyle;
            ctx.fillText(ansOpts[i], optX + optW / 2 + optW * i, optTxtY, optW);
            ctx.stroke();
        }
    } else {
        // draw action buttons
        ctx.font = actionBoxTxtFontStyle;
        for (i = 0; i < actions.length; i++) {
            if (i == curActionIndex) {
                ctx.fillStyle = "yellow";
                ctx.fillRect(actionBoxX + actionOptionBoxW * i, actionBoxY, actionOptionBoxW, actionOptionBoxH);
                ctx.beginPath();
            }
            ctx.lineWidth = "6";
            ctx.strokeStyle = "blue";
            ctx.rect(actionBoxX + actionOptionBoxW * i, actionBoxY, actionOptionBoxW, actionOptionBoxH);
            ctx.stroke();
            ctx.fillStyle = "black";
            ctx.fillText(actions[i], actionBoxX + actionOptionBoxW * 0.1 + actionOptionBoxW * i, actionBoxY + actionBoxTxtSize);
        }
    }
    //drawCursor();
}

function adjustView() {
    var newOrientation = (screen.orientation || {}).type || screen.mozOrientation || screen.msOrientation;
    var originW = canvas.width;
    var originH = canvas.height;
    vpWidth = document.documentElement.clientWidth;
    vpHeight = document.documentElement.clientHeight;
    var mapW, mapH;

    if (isMobile) {
        if (newOrientation != screenOrientation) {
            console.log("screen orientation changed to: " + newOrientation);
            canvas.width = vpWidth;
            canvas.height = vpHeight;
            player.changeOrientation(newOrientation, originW, originH, canvas.width, canvas.height);
            for (const mob in mobs) {
                mob.changeOrientation(newOrientation, originW, originH, canvas.width, canvas.height);
            }

            screenOrientation = newOrientation;
        } else {}
    } else {
        mapW = exploreMap.width;
        mapH = exploreMap.height;
        // canvas should be mapW * mapH scale
        if (vpWidth / vpHeight <= mapW / mapH) {
            canvas.width = vpWidth;
            canvas.height = canvas.width * mapH / mapW;
        } else {
            canvas.height = vpHeight;
            canvas.width = canvas.height * mapW / mapH;
        }
        var factor = canvas.width / originW;
        player.scale(factor);
        for (i = 0; i < mobs.length; i++) {
            mobs[i].scale(factor);
        }
    }
}

function drawBackground() {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
}

function drawCursor() {
    if (curGameState === gameStates[1]) {
        if (displayQn == false) {
            // manage cursor position & dimension in relation to action selection box
            cursorX = actionBoxX + actionOptionBoxW * 0.5 + actionOptionBoxW * curActionIndex;
            cursorY = actionBoxY + actionOptionBoxH / 2;
            cursorW = actionOptionBoxW / 3;
        } else {
            cursorX = qnOptW / 2 + qnOptW * ansOptIndex;
            cursorY = optY + qnOptH / 2;
            cursorW = qnOptW / 3;
            cursorH = cursorW / cursorImg.width * cursorImg.height;
        }
    }
    ctx.drawImage(cursor, cursorX, cursorY, cursorW, cursorH);
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

function generateQn(opr, range) {
    var fNum = Math.ceil(Math.random() * range);
    var sNum = Math.ceil(Math.random() * range);
    var ansRange;
    qn = "How much is " + fNum + " " + opr + " " + sNum + "?";
    ansOpts = [];
    indexOfAns = Math.floor(Math.random() * 4);

    if (opr === "*") {
        ans = fNum * sNum;
        ansRange = range * range;
    }
    if (opr === "/") {
        ans = fNum / sNum;
        ansRange = range;
    }
    if (opr === "+") {
        ans = fNum + sNum;
        ansRange = range + range;
    }
    if (opr === "-") {
        ans = fNum - sNum;
        ansRange = range;
    }

    //create 3 wrong options different from other options & add ans & wrong options in ops[];
    for (i = 0; i < 4; i++) {
        if (i == indexOfAns) {
            ansOpts.push(ans);
        } else {
            var opt = Math.ceil(Math.random() * ansRange);
            while (ansOpts.includes(opt) || opt == ans) {
                opt = Math.ceil(Math.random() * ansRange);
            }
            ansOpts.push(opt);
        }
    }
}

window.addEventListener("keydown", function(e) {
    keys[e.key] = true;
    // console.log(e.key);
    if (curGameState === gameStates[0]) {
        player.moving = true;
        if (e.key == "=") {
            console.log(player.id);
            save_character(player);
            // retrieve_characters();
        }
    }
    if (curGameState === gameStates[1]) {
        // Battle state
        if (e.key == 'Escape') {
            if (displayQn == true) {
                // cur displaying question, returning to action selection
                displayQn = false;
            } else {
                // cur displaying action selection, return to explore state
                curGameState = gameStates[0];
                player.disEngageBattle(canvas.width * 0.05);
                battleMob.disEngageBattle(canvas.width * 0.05);
                mobs.push(battleMob);
            }
        }

        if (displayQn == false) {
            // cur displaying action options
            if (e.key == 'ArrowRight') {
                if (curActionIndex == actions.length - 1) {
                    curActionIndex = 0;
                } else {
                    curActionIndex += 1;
                }
            }
            if (e.key == 'ArrowLeft') {
                if (curActionIndex == 0) {
                    curActionIndex = actions.length - 1;
                } else {
                    curActionIndex -= 1;
                }
            }
            curAction = actions[curActionIndex];
            if (e.key == ' ' || e.key == 'Enter') {
                if (curActionIndex == 0 || curActionIndex == 1) {
                    // attack or magic is selected
                    // create the first qn
                    generateQn('+', 10);
                    // initiate Qn Box within Action box
                    qnX = actionBoxX;
                    qnY = actionBoxY;
                    qnBoxW = actionBoxW;
                    qnBoxH = actionBoxH / 3 * 2;
                    qnTxtSize = qnBoxH / 3 * 2;
                    qnTxtFontStyle = qnTxtSize + "px " + txtStyle;
                    qnTxtX = qnX;
                    qnTxtY = qnY + qnTxtSize;
                    qnOptW = actionBoxW / ansOpts.length;
                    qnOptH = actionBoxH / 3;
                    optX = actionBoxX;
                    optY = qnY + qnBoxH;
                    optW = actionBoxW / ansOpts.length;
                    optH = actionBoxH / 3;
                    optTxtSize = optH / 3 * 2;
                    optTxtFontStyle = optTxtSize + "px " + txtStyle;
                    optTxtY = optY + optTxtSize;
                    displayQn = true;
                    ansOptIndex = 0;
                }
                if (curActionIndex == 2) {
                    // escape is selected
                    // cur displaying action selection, return to explore state
                    curGameState = gameStates[0];
                    player.disEngageBattle(canvas.width * 0.05);
                    battleMob.disEngageBattle(canvas.width * 0.05);
                    mobs.push(battleMob);
                }
            }
        } else {
            // cur displaying qn and options
            if (e.key == 'ArrowRight') {
                if (ansOptIndex == ansOpts.length - 1) {
                    ansOptIndex = 0;
                } else {
                    ansOptIndex += 1;
                }
            }
            if (e.key == 'ArrowLeft') {
                if (ansOptIndex == 0) {
                    ansOptIndex = ansOpts.length - 1;
                } else {
                    ansOptIndex -= 1;
                }
            }
            ansOptSelected = ansOpts[ansOptIndex];
        }
    }
});

window.addEventListener("keyup", function(e) {
    keys[e.key] = false;
    if (curGameState === 'Explore') {
        player.moving = false;
    }
})

var touch, firstTouchX, firstTouchY, touchMoveX, touchMoveY;
var trackMove = false;

function trackTouchMove(e) {
    touchDetected = true;
    touchMoveX = e.touches[0].clientX - firstTouchX;
    touchMoveY = e.touches[0].clientY - firstTouchY;
    touchArrowW = canvas.width * 0.1;
    touchArrowH = touchArrowW / touchArrowImg.width * touchArrowImg.height;
    if (touchMoveX > 0) {
        touchRotateRadians = Math.atan(touchMoveY / touchMoveX);
    } else {
        touchRotateRadians = Math.atan(touchMoveY / touchMoveX) + 2;
    }
    console.log(touchRotateRadians);

    if (curGameState === gameStates[0] && trackMove == true) {
        player.moving = true;
        if (touchMoveX > 0) {
            keys["ArrowLeft"] = false;
            keys["ArrowRight"] = true;
        }
        if (touchMoveX < 0) {
            keys["ArrowLeft"] = true;
            keys["ArrowRight"] = false;
        }
        if (touchMoveY > 0) {
            keys["ArrowUp"] = false;
            keys["ArrowDown"] = true;
        }
        if (touchMoveY < 0) {
            keys["ArrowUp"] = true;
            keys["ArrowDown"] = false;
        }
    }
}

function drawTouchArrow() {
    ctx.translate(firstTouchX, firstTouchY);
    ctx.rotate(touchRotateRadians);
    ctx.drawImage(touchArrow, 0, 0, touchArrowW, touchArrowH);
    ctx.rotate(-touchRotateRadians);
    ctx.translate(-firstTouchX, -firstTouchY);
}

function trackMouseMove(e) {
    var mouseMoveX = e.pageX - firstTouchX;
    var mouseMoveY = e.pageY - firstTouchY;

    if (curGameState === gameStates[0] && trackMove == true) {
        player.moving = true;
        if (mouseMoveX > 0) {
            keys["ArrowLeft"] = false;
            keys["ArrowRight"] = true;
        }
        if (mouseMoveX < 0) {
            keys["ArrowLeft"] = true;
            keys["ArrowRight"] = false;
        }
        if (mouseMoveY > 0) {
            keys["ArrowUp"] = false;
            keys["ArrowDown"] = true;
        }
        if (mouseMoveY < 0) {
            keys["ArrowUp"] = true;
            keys["ArrowDown"] = false;
        }
    }
}

function disableMove(e) {
    touchDetected = false;
    window.removeEventListener("mousemove", trackMouseMove);
    window.removeEventListener("touchmove", trackTouchMove);
    trackMove = false
    player.moving = false;
    keys["ArrowRight"] = false;
    keys["ArrowLeft"] = false;
    keys["ArrowDown"] = false;
    keys["ArrowUp"] = false;
    window.removeEventListener("mouseup", disableMove);
    window.removeEventListener("touchend", disableMove);
}

window.addEventListener("mousedown", function(e) {
    // e.preventDefault();
    firstTouchX = e.pageX;
    firstTouchY = e.pageY;
    if (curGameState === gameStates[0]) {
        trackMove = true;
        window.addEventListener("mousemove", trackMouseMove);
        window.addEventListener("mouseup", disableMove);
    }
})

window.addEventListener("touchstart", function(e) {
    e.preventDefault();
    touch = e.touches[0];
    // console.log(touch.pageX + ' / ' + touch.pageY);
    firstTouchX = touch.clientX;
    firstTouchY = touch.clientY;
    if (curGameState === gameStates[0]) {
        // console.log("touch start");
        trackMove = true;
        window.addEventListener("touchmove", trackTouchMove);
        window.addEventListener("touchend", disableMove);
    }
}, { passive: false })

function save_progress() {
    var today = new Date()
    fetch('/save_progress', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            // subject: subject,
            qnId: qnId,
            result: result,
            answerTxt: answerTxt,
            answerPic: answerPic,
            duration: duration,
        }),
    });
    console.log("progress saved");
}

function save_character(char) {
    var char_object = {
        id: char.id,
        character: JSON.stringify(char),
    };
    // console.log(char.id);
    fetch('/game/save_character', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(char_object),
    });
    console.log("Character saved")
    console.log(char_object['id'])
        // retrieve_characters();
}

function retrieve_characters() {
    var fetch_url = "/game/load_characters";
    // savedCharacters = [];
    fetch(fetch_url)
        .then(res => {
            if (res.ok) {
                console.log('FETCH Characters SUCCESS');
            } else {
                console.log('FETCH Characters UNSUCCESSFUL');
            }
            return res.json()
        })
        .then(function(char) {
            var character = JSON.parse(char.character);
            character.id = char.id
            console.log(player.sprite.src);
            match_char_attributes(player, character);
        })
        .catch(error => console.log('ERROR LOAD CHARACTERS: ' + error))
    console.log("Characters Loaded");
}

function match_char_attributes(char, saved_char) {
    char.id = saved_char.id;

    // player game attribute
    char.name = saved_char.name;
    char.lvl = saved_char.lvl;
    char.maxHp = saved_char.maxHp;
    char.maxMp = saved_char.maxMp;
    char.curHp = saved_char.curHp;
    char.curMp = saved_char.maxMp;
    char.maxExp = saved_char.maxExp;
    char.curExp = saved_char.curExp;
    char.atk = saved_char.atk;
    char.def = saved_char.def;
    char.gold = saved_char.gold;
    char.inv = saved_char.inv;

    // return char;
}