let vpWidth, vpHeight;
var screenOrientation = (screen.orientation || {}).type || screen.mozOrientation || screen.msOrientation;
let background = new Image();
let cursor = new Image();
let help = new Image();
let charIcon = new Image();
let saveIcon = new Image();
const helpImg = {
    src: "static/img/red-question-mark.png",
    width: 835,
    height: 835,
};
const charIconImg = {
    src: "static/img/letter-c.png",
    width: 512,
    height: 512,
};
const redCrossImg1 = {
    src: "static/img/red-cross.png",
    width: 645,
    height: 644,
};
const saveIconImg = {
    src: "static/img/save-icon.png",
    width: 442,
    height: 442,
};
// const redCrossImg2 = {
//     src: "static/img/Red-cross-mark-icon.png",
//     width: 0,
//     height: 0,
// };
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
};

let touchArrow = new Image();
const touchArrowImg = {
    src: "static/img/touchArrow.png",
    width: 801,
    height: 610,
}
let touchDetected = false;
let touchRotateRadians;
let touchArrowW, touchArrowH;

let body = document.body;
let canvas, ctx;
const isMobile = ('ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/));

class Player {
    constructor(x, y, width, height) {
        this.id = -1;
        this.sprite = new Image();
        this.sprite.src = "static/img/PlayerSpriteSheet.png";
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

        this.setHpMpBars();
    }

    review(x, y, width) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = this.width / this.srcFrameW * this.srcFrameH;
        if (curGameState == gameStates[0]) {
            this.speed = this.width / 3;
        }
        this.setHpMpBars();
    }

    setHpMpBars() {
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
    }

    engageBattle() {
        this.originX = this.x;
        this.originY = this.y;
        this.frameX = 0;
        this.frameY = 1;
        this.moving = true;
        this.speed = 0;
    }

    disEngageBattle(width) {
        this.x = this.originX;
        this.y = this.originY;
        this.moving = false;
        this.speed = this.width / 3;
    }

    levelUp() {
        this.lvl += 1;
        this.maxHp = this.lvl * 100 + 50;
        this.maxMp = this.lvl * 50 + 50;
        this.curHp = this.maxHp;
        this.curMp = this.maxMp;
        this.maxExp = this.lvl * 50 + 10;
        this.atk = this.lvl * 30 + 20;
        this.def = this.lvl * 15 + 15;
        console.log('Player level up to: ' + this.lvl);
    }

    addExp(exp) {
        this.curExp += exp;
        while (this.curExp >= this.maxExp) {
            this.curExp -= this.maxExp;
            this.levelUp();
        }
        if (this.curExp <= 0) {
            // if exp is < 0, player reduces cur exp until 0
            this.curExp = 0;
        }
    }

    killed() {
        this.curExp -= 10;
        if (this.curExp < 0) {
            this.curExp = 0
        }
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

        // display level
        this.lvlW = this.width;
        this.lvlH = this.height * 0.3;
        this.lvlX = this.x + this.lvlW / 3;
        this.lvlY = this.y - this.height * 0.3 + this.lvlH;

        this.lvlFontSize = this.lvlH * 0.8;
        this.fontStyle = this.lvlFontSize + "px Arial";
        // display hp / mp
        this.setHpMpBars();
    }

    review(mobInitX, mobInitY, mobX, mobY, mobW) {
        this.initX = mobInitX;
        this.initY = mobInitY;
        this.x = mobX;
        this.y = mobY;
        this.width = mobW;
        this.height = this.width / this.srcFrameW * this.srcFrameH;
        if (curGameState == gameStates[0]) {
            this.speed = this.width / 10;
            this.moveLimit = this.width * 2;
        }

        // display level
        this.lvlW = this.width;
        this.lvlH = this.height * 0.3;
        this.lvlX = this.x + this.lvlW / 3;
        this.lvlY = this.y - this.height * 0.3 + this.lvlH;

        this.lvlFontSize = this.lvlH * 0.8;
        this.fontStyle = this.lvlFontSize + "px Arial";
        // display hp / mp
        this.setHpMpBars();

    }

    setHpMpBars() {
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
        // write the level of the mob
        ctx.fillStyle = "black";
        ctx.font = this.fontStyle;
        ctx.fillText("lvl " + this.lvl, this.lvlX, this.lvlY, this.lvlW)
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
            if (this.moving == true) {
                if (this.direction === "down") {
                    if (this.y >= this.initY + this.moveLimit || this.y >= canvas.height - this.height * 1.1) {
                        this.direction = "right";
                        this.frameY = 1;
                    } else {
                        this.y += this.speed;
                    }
                }

                if (this.direction === "right") {
                    if (this.x >= this.initX + this.moveLimit || this.x >= canvas.width - this.width) {
                        this.direction = "up";
                        this.frameY = 2;
                    } else {
                        this.x += this.speed;
                    }
                }

                if (this.direction === "up") {
                    if (this.y <= this.initY - this.moveLimit || this.y <= 0 + this.height * 0.1) {
                        this.direction = "left";
                        this.frameY = 0;
                    } else {
                        this.y -= this.speed;
                    }
                }

                if (this.direction === "left") {
                    if (this.x < this.initX - this.moveLimit || this.x <= 0) {
                        this.direction = "down";
                        this.frameY = 2;
                    } else {
                        this.x -= this.speed;
                    }
                }
            }
        }
        if (this.frameX < 7 && this.moving) this.frameX++
            else this.frameX = 0;
    }

    engageBattle() {
        // this.x = x;
        // this.y = y;
        // this.width = width;
        // this.height = this.width / this.srcFrameW * this.srcFrameH;
        this.frameX = 0;
        this.frameY = 0;
        this.moving = true;
        this.speed = 0;

        // display level
        this.lvlW = this.width;
        this.lvlH = this.height * 0.3;
        this.lvlX = this.x + this.lvlW / 3;
        this.lvlY = this.y - this.height * 0.3 + this.lvlH;

        this.lvlFontSize = this.lvlH * 0.8;
        this.fontStyle = this.lvlFontSize + "px Arial";
        // display hp / mp
        // this.hpBarX = this.x;
        // this.hpBarY = this.y + this.height;
        // this.hpBarW = this.width;
        // this.hpBarH = this.height * 0.1;
        // this.curHpBarW = this.curHp / this.maxHp * this.hpBarW;
        // this.mpBarX = this.x;
        // this.mpBarY = this.hpBarY + this.hpBarH;
        // this.mpBarW = this.width;
        // this.mpBarH = this.height * 0.1;
        // this.curMpBarW = this.curMp / this.maxMp * this.mpBarW;
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

        // display level
        this.lvlW = this.width;
        this.lvlH = this.height * 0.3;
        this.lvlX = this.x + this.lvlW / 3;
        this.lvlY = this.y - this.height * 0.3 + this.lvlH;

        this.lvlFontSize = this.lvlH * 0.8;
        this.fontStyle = this.lvlFontSize + "px Arial";
        // display hp / mp
        // this.hpBarX = this.x;
        // this.hpBarY = this.y + this.height;
        // this.hpBarW = this.width;
        // this.hpBarH = this.height * 0.1;
        // this.curHpBarW = this.curHp / this.maxHp * this.hpBarW;
        // this.mpBarX = this.x;
        // this.mpBarY = this.hpBarY + this.hpBarH;
        // this.mpBarW = this.width;
        // this.mpBarH = this.height * 0.1;
        // this.curMpBarW = this.curMp / this.maxMp * this.mpBarW;
    }
}

let fps, fpsInterval, startTime, now, then, elapsed;
let player;
let playerX, playerY, playerW, playerH;
let helpX, helpY, helpW, helpH;
let charInfoX, charInfoY, charInfoW, charInfoH;
let saveX, saveY, saveW, saveH;
let gameStates = ['Explore', 'Battle'];
let curGameState = gameStates[0];
let keys = [];
let mobs = [];
let mobNum = 3;
let mapLvl = 1;
const mobDirs = ["up", "right", "down", "left"];
var savedCharacters = [];
var battleMob;
var mobLastAtkTime;
const mobAtkInterval = 5000; // battle mob attack interval is 5 second
const actions = ["Attack", "Magic", "Escape"];
let curActionIndex = 0;
let curAction = actions[curActionIndex];
let actionBoxX, actionBoxY, actionBoxW, actionBoxH;
let actionOptionBoxW, actionOptionBoxH
let actionBoxTxtSize, actionBoxTxtStyle, actionBoxTxtFontStyle;
let displayQn = false;
let subject = 'mat';
let qn = 'some question';
let ansOpts = [];
let ansOptIndex = 0;
let ansOptSelected = '';
let ans;
let txtStyle = "Arial";
let indexOfAns = -1;
let qnBoxX, qnBoxY, qnBoxW, qnBoxH, qnTxtX, qnTxtY, qnTxtSize, qnTxtFontStyle, optX, optY, optW, optH, optTxtSize, optTxtFontStyle, optTxtX, optTxtY;
let cursorX, cursorY, cursorW, cursorH;
let answerCorrect = false;
let qnStart, qnEnd;

let ops = ['+', 'count'];
let op;
// questions resources
let qnImg = new Image()
const cupcakeImg = {
    name: 'cupcake',
    src: "static/img/questions/cupcake.png",
    width: 512,
    height: 512,
}

let notifications = [];
let displayHelp = false;
let displayCharInfo = false;

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
    body.style.margin = 0;
    document.body.insertBefore(canvas, document.body.childNodes[0]);
    background.src = exploreMap.src;
    cursor.src = cursorImg.src;
    touchArrow.src = touchArrowImg.src;
    help.src = helpImg.src;
    charIcon.src = charIconImg.src;
    saveIcon.src = saveIconImg.src;
    // redCross.src = redCrossImg1.src;
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
    // initialize mobs
    initMobs();

    // initialize save icon
    saveX = canvas.width * 0.85;
    saveY = canvas.height * 0.05;
    saveW = canvas.width * 0.04;
    saveH = saveW / saveIconImg.width / saveIconImg.height;
    // initialize char info icon
    charInfoX = canvas.width * 0.9;
    charInfoY = canvas.height * 0.05;
    charInfoW = canvas.width * 0.04;
    charInfoH = charInfoW / charIconImg.width / charIconImg.height;
    // initialize question mark
    helpX = canvas.width * 0.95;
    helpY = canvas.height * 0.05;
    helpW = canvas.width * 0.04;
    helpH = helpW / helpImg.width / helpImg.height;

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
        adjustView();
        ctx.imageSmoothingEnabled = false;
        if (curGameState === gameStates[0]) {
            // explore state
            drawBackground();
            for (i = 0; i < mobs.length; i++) {
                mobs[i].draw(ctx);
            }
            player.draw(ctx);
            if (isMobile && touchDetected) {
                drawTouchArrow();
            }
            player.move();
            for (i = 0; i < mobs.length; i++) {
                mobs[i].move();
                if (distance(player, mobs[i]) <= player.width / 2 + mobs[i].width / 2) {
                    // player encounter mob
                    battleMob = mobs[i];
                    mobs.splice(i, 1);
                    curGameState = gameStates[1];
                    curActionIndex = 0;
                    curAction = actions[curActionIndex];
                    initiate_action_box();
                    player.engageBattle();
                    battleMob.engageBattle();
                    mobLastAtkTime = Date.now();
                    console.log("engaging battle");
                }
            }
        }
        if (curGameState === gameStates[1]) {
            // battle state
            drawBackground();
            drawActionsBox();
            if (!isMobile) {
                drawCursor();
            }
            player.draw(ctx);
            battleMob.draw(ctx);
            player.move();
            battleMob.move();
            manageMobAtk();
        }
        displayNotifications();
        drawSaveIcon();
        drawCharInfo();
        drawHelp();
    }
}

function displayNotifications() {
    manageNotificationScroll();
    var notificationTxtSize = canvas.height / 8 / 3;
    var notificationTxtStyle = notificationTxtSize + "px Arial";
    for (i = 0; i < notifications.length; i++) {
        ctx.fillStyle = "white";
        ctx.globalAlpha = 0.4;
        ctx.fillRect(notifications[i].x, notifications[i].y, notifications[i].width, notifications[i].height);
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = "black";
        ctx.font = notificationTxtStyle;
        ctx.fillText(notifications[i].txt, notifications[i].x + notificationTxtSize, notifications[i].y + notificationTxtSize * 2, notifications[i].width);
    }
}

function manageNotificationScroll() {
    if (notifications.length > 0) {
        for (i = 0; i < notifications.length; i++) {
            if (i == 0) {
                notifications[i].x = canvas.width / 4;
                notifications[i].y -= canvas.height / 50;
                notifications[i].width = canvas.width / 2;
                notifications[i].height = canvas.height / 8;
            } else {
                if (notifications[i].y >= notifications[i - 1].y + notifications[i - 1].height) {
                    notifications[i].x = canvas.width / 4;
                    notifications[i].y -= canvas.height / 50;
                    notifications[i].width = canvas.width / 2;
                    notifications[i].height = canvas.height / 8;
                }
            }
            if (notifications[i].y <= canvas.height / 10) {
                notifications.shift();
            }
        }
    }
}

function newNotification(txt) {
    var notification = {
        txt: txt,
        x: canvas.width / 4,
        y: canvas.height / 2,
        width: canvas.width / 2,
        height: canvas.height / 8,
    };
    notifications.push(notification);
}

function drawHelp() {
    var txtSize, txtStyle;
    if (displayHelp == false) {
        help.src = helpImg.src;
        ctx.drawImage(help, helpX, helpY, helpW, helpH);
    } else {
        help.src = redCrossImg1.src;
        var helpTxt = [];
        if (isMobile) {
            // display touch help on mobile
            if (curGameState === gameStates[0]) {
                helpTxt.push("Press H for help;");
                helpTxt.push("Press Arrow Key to move character;");
                helpTxt.push("Press H for help;");
                helpTxt.push("Press Arrow Key to move character;");
            }
            if (curGameState === gameStates[1]) {
                helpTxt.push("Press LEFT ARROW / RIGHT ARROW to choose;");
                helpTxt.push("Press SPACE or ENTER to confirm selection.");
            }
        } else {
            if (curGameState === gameStates[0]) {
                helpTxt.push("Press H for help;");
                helpTxt.push("Press Arrow Key to move character;");
                helpTxt.push("Press H for help;");
                helpTxt.push("Press Arrow Key to move character;");
            }
            if (curGameState === gameStates[1]) {
                helpTxt.push("Press LEFT ARROW / RIGHT ARROW to choose;");
                helpTxt.push("Press SPACE or ENTER to confirm selection.");
            }
        }
        txtSize = canvas.height * 0.05;
        txtStyle = "Arial";
        ctx.fillStyle = "white";
        ctx.fillRect(canvas.width * 0.02, canvas.height * 0.01, canvas.width * 0.96, canvas.height * 0.96);

        ctx.fillStyle = "black";
        ctx.font = txtSize + "px " + txtStyle;
        for (i = 0; i < helpTxt.length; i++) {
            ctx.fillText(helpTxt[i], canvas.width * 0.02 + txtSize, canvas.height * 0.05 + txtSize * i, canvas.width * 0.85);
        }
        ctx.drawImage(help, helpX, helpY, helpW, helpH);
    }
}

function drawCharInfo() {
    var txtSize, txtStyle;
    if (displayCharInfo == false) {
        charIcon.src = charIconImg.src;
        ctx.drawImage(charIcon, charInfoX, charInfoY, charInfoW, charInfoH);
    } else {
        charIcon.src = redCrossImg1.src;
        var charInfo = [];
        if (isMobile) {
            charInfo.push("Name: " + player.name);
            charInfo.push("Level: " + player.lvl);
            charInfo.push("Max HP: " + player.maxHp);
            charInfo.push("Cur HP: " + player.curHp);
            charInfo.push("Max MP: " + player.maxMp);
            charInfo.push("Cur HP: " + player.curMp);
            charInfo.push("Max EXP: " + player.maxExp);
            charInfo.push("Cur EXP: " + player.curExp);
            charInfo.push("ATK: " + player.atk);
            charInfo.push("DEF: " + player.def);
        } else {
            // something else
        }
        txtSize = canvas.height * 0.05;
        txtStyle = "Arial";
        ctx.fillStyle = "white";
        ctx.fillRect(canvas.width * 0.02, canvas.height * 0.01, canvas.width * 0.96, canvas.height * 0.96);

        ctx.fillStyle = "black";
        ctx.font = txtSize + "px " + txtStyle;
        for (i = 0; i < charInfo.length; i++) {
            ctx.fillText(charInfo[i], canvas.width * 0.02 + txtSize, canvas.height * 0.05 + txtSize * i, canvas.width * 0.85);
        }
        ctx.drawImage(charIcon, charInfoX, charInfoY, charInfoW, charInfoH);
    }
}

function drawSaveIcon() {
    ctx.drawImage(saveIcon, saveX, saveY, saveW, saveH);
}

function initiate_action_box() {
    displayQn = false; // display action choices, not display questions
    curActionIndex = 0;
    curAction = actions[curActionIndex]; // default action to point at first option
    // initiate Action box element dimentions
    actionBoxX = 0;
    actionBoxW = canvas.width;
    actionBoxH = canvas.height * 0.3;
    actionBoxY = canvas.height * 0.7;
    actionOptionBoxH = actionBoxH;
    actionOptionBoxW = actionBoxW / actions.length;
    actionBoxTxtSize = actionOptionBoxH * 0.3;
    actionBoxTxtStyle = "Arial";
    actionBoxTxtFontStyle = actionBoxTxtSize + "px " + actionBoxTxtStyle;

    // initiate cursor
    cursorX = actionBoxX + actionOptionBoxW / 2;
    cursorY = actionBoxY + actionOptionBoxH / 2;
    cursorW = actionOptionBoxW / 3;
    cursorH = cursorW / cursorImg.width * cursorImg.height;
}

function generateQn(opr, range) {
    var ansRange;
    ansOpts = [];
    indexOfAns = Math.floor(Math.random() * 4);
    if (opr == '+') {
        var fNum = Math.ceil(Math.random() * range);
        var sNum = Math.ceil(Math.random() * range);
        qn = "How much is " + fNum + " " + opr + " " + sNum + "?";
        ans = fNum + sNum;
        ansRange = range + range;
    }

    if (opr == '*') {
        var fNum = Math.ceil(Math.random() * range);
        var sNum = Math.ceil(Math.random() * range);
        qn = "How much is " + fNum + " " + opr + " " + sNum + "?";
        ans = fNum * sNum;
        ansRange = range * range;
    }

    if (opr === "count") {
        var count = Math.ceil(Math.random() * range);
        qnImg.src = cupcakeImg.src;
        qn = 'How many ' + cupcakeImg.name + ' do you see below?';
        ans = count;
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
    qnStart = Date.now();
}

function createQnBox() {
    // create the qn
    op = ops[Math.floor(Math.random() * ops.length)];
    generateQn(op, 10);
    qnBoxX = actionBoxX;
    qnBoxY = actionBoxY;
    qnBoxW = actionBoxW / 3 * 2;
    qnBoxH = actionBoxH / 3;
    qnTxtSize = qnBoxH / 3;
    qnTxtFontStyle = qnTxtSize + "px " + txtStyle;
    qnTxtX = qnBoxX + qnTxtSize;
    qnTxtY = qnBoxY + qnTxtSize * 2;
    optX = qnBoxX + qnBoxW;
    optY = qnBoxY;
    optW = qnBoxW / 2;
    optH = actionBoxH / 4;
    optTxtSize = optH / 3;
    optTxtFontStyle = optTxtSize + "px " + txtStyle;
    optTxtX = optX + optTxtSize * 2;
    optTxtY = optY + optTxtSize * 2;
    displayQn = true;
    ansOptIndex = 0;
}

function drawActionsBox() {
    // draw action box
    ctx.fillStyle = "white";
    ctx.fillRect(actionBoxX, actionBoxY, actionBoxW, actionBoxH);

    if (displayQn == true) {
        // draw question & options, place cursor on option 1
        // draw question
        ctx.fillStyle = "black";
        ctx.font = qnTxtFontStyle
        ctx.fillText(qn, qnTxtX, qnTxtY, qnBoxW);

        if (op == 'count') {
            // draw item * count times at x: qnboxX, qnboxY + qnboxH, qnboxW, actionboxH / 3 * 2;
            var drawItemW = qnBoxW / ans;
            var drawItemH = drawItemW / cupcakeImg.width * cupcakeImg.height;
            if (drawItemH > actionBoxH / 3 * 2) {
                // if drawItemH is higher than 2/3 of the Action Box, reduce item height to 2/3 of draw area height and reduce item width accordingly
                drawItemH = actionBoxH / 3 * 2;
                drawItemW = drawItemH / cupcakeImg.height * cupcakeImg.width;
            }
            for (i = 0; i < ans; i++) {
                ctx.drawImage(qnImg, actionBoxX + drawItemW * i, qnBoxY + qnBoxH, drawItemW, drawItemH);
            }
        }
        for (i = 0; i < ansOpts.length; i++) {
            // draw options on the 1/3 right portion of Action Box
            // highlight box selected by player with yellow background
            if (i == ansOptIndex) {
                ctx.fillStyle = "yellow";
                ctx.fillRect(optX, optY + optH * i, optW, optH);
            }
            // draw option button outline
            ctx.lineWidth = "1";
            ctx.strokeStyle = "blue";
            ctx.rect(optX, optY + optH * i, optW, optH);
            ctx.stroke();
            // fill in the option txt
            ctx.fillStyle = "black";
            ctx.font = optTxtFontStyle;
            ctx.fillText(ansOpts[i], optX + optW / 2, optTxtY + optH * i, optW);
            ctx.stroke();
        }
        // }
    } else {
        // draw action buttons
        ctx.font = actionBoxTxtFontStyle;
        for (i = 0; i < actions.length; i++) {
            if (i == curActionIndex) {
                ctx.fillStyle = "yellow";
                ctx.fillRect(actionBoxX + actionOptionBoxW * i, actionBoxY, actionOptionBoxW, actionOptionBoxH);
                // ctx.beginPath();
            }
            ctx.lineWidth = "1";
            ctx.strokeStyle = "blue";
            ctx.rect(actionBoxX + actionOptionBoxW * i, actionBoxY, actionOptionBoxW, actionOptionBoxH);
            ctx.stroke();
            ctx.fillStyle = "black";
            ctx.font = actionBoxTxtFontStyle;
            ctx.fillText(actions[i], actionBoxX + actionOptionBoxW * 0.1 + actionOptionBoxW * i, actionBoxY + actionBoxTxtSize, actionOptionBoxW);
        }
    }
}

function reviewActionBox() {
    // initiate Action box element dimentions
    actionBoxX = 0;
    actionBoxW = canvas.width;
    actionBoxH = canvas.height * 0.3;
    actionBoxY = canvas.height * 0.7;

    // initiate cursor
    cursorX = actionBoxX + actionOptionBoxW / 2;
    cursorY = actionBoxY + actionOptionBoxH / 2;
    cursorW = actionOptionBoxW / 3;
    cursorH = cursorW / cursorImg.width * cursorImg.height;

    if (displayQn == true) {
        qnBoxX = actionBoxX;
        qnBoxY = actionBoxY;
        qnBoxW = actionBoxW / 3 * 2;
        qnBoxH = actionBoxH / 3;
        qnTxtSize = qnBoxH / 3;
        qnTxtFontStyle = qnTxtSize + "px " + txtStyle;
        qnTxtX = qnBoxX + qnTxtSize;
        qnTxtY = qnBoxY + qnTxtSize * 2;
        optX = qnBoxX + qnBoxW;
        optY = qnBoxY;
        optW = qnBoxW / 2;
        optH = actionBoxH / 4;
        optTxtSize = optH / 3;
        optTxtFontStyle = optTxtSize + "px " + txtStyle;
        optTxtX = optX + optTxtSize * 2;
        optTxtY = optY + optTxtSize * 2;
    } else {
        actionOptionBoxH = actionBoxH;
        actionOptionBoxW = actionBoxW / actions.length;
        actionBoxTxtSize = actionOptionBoxH * 0.3;
        actionBoxTxtStyle = "Arial";
        actionBoxTxtFontStyle = actionBoxTxtSize + "px " + actionBoxTxtStyle;
    }
}

function adjustView() {
    var originW = canvas.width;
    var originH = canvas.height;

    vpWidth = document.documentElement.clientWidth;
    vpHeight = document.documentElement.clientHeight;

    // review player position and size
    var playerXPerc, playerYPerc, playerX, playerY, playerW;
    if (curGameState == gameStates[0]) {
        playerXPerc = player.x / originW;
        playerYPerc = player.y / originH;
        if (vpWidth > vpHeight) {
            playerW = vpWidth * 0.05;
        } else {
            playerW = vpHeight * 0.05 / player.srcFrameH * player.srcFrameW;
        }
        playerX = vpWidth * playerXPerc;
        playerY = vpHeight * playerYPerc;
        player.review(playerX, playerY, playerW);

        // review mobs position and size
        for (i = 0; i < mobs.length; i++) {
            var mobInitXPerc, mobInitYPerc, mobXPerc, mobYPerc, mobInitX, mobInitY, mobX, mobY, mobW;
            mobInitXPerc = mobs[i].initX / originW;
            mobInitYPerc = mobs[i].initY / originH;
            mobXPerc = mobs[i].x / originW;
            mobYPerc = mobs[i].y / originH;
            if (vpWidth > vpHeight) {
                mobW = vpWidth * 0.05;
            } else {
                mobW = vpHeight * 0.05 / mobs[i].srcFrameH * mobs[i].srcFrameW;
            }
            mobInitX = vpWidth * mobInitXPerc;
            mobInitY = vpHeight * mobInitYPerc;
            mobX = vpWidth * mobXPerc;
            mobY = vpHeight * mobYPerc;
            mobs[i].review(mobInitX, mobInitY, mobX, mobY, mobW);
        }
    }
    if (curGameState == gameStates[1]) {
        if (vpWidth > vpHeight) {
            playerH = vpHeight / 4;
            playerW = playerH / player.srcFrameH * player.srcFrameW;
            playerX = vpWidth / 4 - playerW / 2;
            playerY = vpHeight / 3 - playerH / 2;
        } else {
            playerW = vpWidth / 4;
            playerH = playerW / player.srcFrameW * player.srcFrameH;
            playerX = vpWidth / 4 - playerW / 2;
            playerY = vpHeight / 3 - playerW / player.srcFrameW * player.srcFrameH / 2;
        }
        player.review(playerX, playerY, playerW)

        // review battle mob
        mobInitXPerc = battleMob.initX / originW;
        mobInitYPerc = battleMob.initY / originH;
        mobInitX = vpWidth * mobInitXPerc;
        mobInitY = vpHeight * mobInitYPerc;
        if (vpWidth > vpHeight) {
            mobW = vpHeight / 4 / battleMob.srcFrameH * battleMob.srcFrameW;
            mobX = vpWidth / 4 * 3 - mobW / 2;
            mobY = vpHeight / 3 - mobW / battleMob.srcFrameW * battleMob.srcFrameH / 2;
        } else {
            mobW = vpWidth / 4;
            mobX = vpWidth / 4 * 3 - mobW / 2;
            mobY = vpHeight / 3 - mobW / battleMob.srcFrameW * battleMob.srcFrameH / 2;
        }
        battleMob.review(mobInitX, mobInitY, mobX, mobY, mobW);

        // review action box below
        reviewActionBox();
        // review action box above
    }


    canvas.width = vpWidth;
    canvas.height = vpHeight;
    if (vpWidth > vpHeight) {
        // resize question mark
        helpW = canvas.width * 0.03;
        helpH = helpW / helpImg.width * helpImg.height;
        helpX = canvas.width - helpW;
        helpY = canvas.height * 0.05;
        // resize char info icon
        charInfoW = canvas.width * 0.03;
        charInfoH = charInfoW / charIconImg.width * charIconImg.height;
        charInfoX = helpX - charInfoW;
        charInfoY = canvas.height * 0.05;
        // resize save icon
        saveW = canvas.width * 0.03;
        saveH = saveW / saveIconImg.width * saveIconImg.height;
        saveX = charInfoX - saveW;
        saveY = canvas.height * 0.05;
    } else {
        // resize question mark
        helpH = canvas.height * 0.03;
        helpW = helpH / helpImg.height * helpImg.width;
        helpX = canvas.width - helpW;
        helpY = 0;
        // resize char info icon
        charInfoH = canvas.height * 0.03;
        charInfoW = charInfoH / charIconImg.height * charIconImg.width;
        charInfoX = canvas.width - charInfoW;
        charInfoY = helpY + helpH;
        // resize save icon
        saveH = canvas.height * 0.03;
        saveW = saveH / saveIconImg.height * saveIconImg.width;
        saveX = canvas.width - saveW;
        saveY = charInfoY + charInfoH;
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
            cursorX = optW / 2 + optW * ansOptIndex;
            cursorY = optY + optH / 2;
            cursorW = optW / 3;
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
        var lvl = Math.ceil(Math.random() * 3) + 3 * (mapLvl - 1);
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

function attackMob(mob, isCritical) {
    var dmg = player.atk - mob.def;
    if (isCritical) {
        dmg *= 1.5;
        newNotification('critical attack');
    }
    if (dmg < 0) {
        dmg = 0;
        newNotification('dmg is too low');
        console.log('dmg is too low');
    }
    mob.curHp -= dmg;

    newNotification('player dealt ' + dmg + 'dmg to the mob');
    if (mob.curHp <= 0) {
        // battleMob is killed
        var exp = 10; //// temperary set to 10 for now, need to implement variable based on level difference.
        newNotification('battlemob is dead');
        console.log('battlemob is dead');
        if (mobs.length == 0) {
            initMobs();
        }
        player.addExp(exp);
        player.disEngageBattle(canvas.width * 0.05);
        displayQn = false;
        resetKeys();
        curGameState = gameStates[0];
    }
}

function magicMob(mob, isCritical) {
    var dmg = player.atk - mob.def;
    if (isCritical) {
        dmg *= 1.5;
    }
    if (dmg < 0) {
        dmg = 0;
        console.log('dmg is too low');
    }
    mob.curHp -= dmg;
    if (mob.curHp <= 0) {
        player.addExp(exp);
        player.disEngageBattle(canvas.width * 0.05);
        displayQn = false;
        resetKeys();
        curGameState = gameStates[0];
    }
}

function resetKeys() {
    keys["ArrowRight"] = false;
    keys["ArrowLeft"] = false;
    keys["ArrowDown"] = false;
    keys["ArrowUp"] = false;
}

window.addEventListener("keydown", function(e) {
    keys[e.key] = true;
    if (e.key == "h" || e.key == 'H') {
        if (displayHelp == true) {
            displayHelp = false;
            for (i = 0; i < mobs.length; i++) {
                mobs[i].moving = true;
            }
        } else {
            displayHelp = true;
            for (i = 0; i < mobs.length; i++) {
                mobs[i].moving = false;
            }
        }
    }
    if (curGameState === gameStates[0]) {
        player.moving = true;
        if (e.key == "=") {
            save_character(player);
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
                    createQnBox();
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
            if (e.key == ' ' || e.key == 'Enter') {
                // selected the option
                // validate answer option vs correct index
                if (curAction == actions[0]) {
                    if (ansOptIndex == indexOfAns) {
                        attackMob(battleMob, 'critical');
                    } else {
                        attackMob(battleMob, 'normal');
                    }
                }
                if (curAction == actions[1]) {
                    if (ansOptIndex == indexOfAns) {
                        magicMob(player, battleMob, 'critical');
                    } else {
                        magicMob(player, battleMob, 'normal');
                    }
                }
                displayQn = false;
            }
        }
    }
});

window.addEventListener("keyup", function(e) {
    keys[e.key] = false;
    if (curGameState === 'Explore') {
        player.moving = false;
    }
})

var touch, firstTouchX, firstTouchY, touchEndX, touchEndY;
var trackMove = false;

function manageMobAtk() {
    var curTime = Date.now();
    if (curGameState == gameStates[1]) {
        // in battle state
        if (curTime >= mobLastAtkTime + mobAtkInterval) {
            mobAtkPlayer();
            mobLastAtkTime = curTime;
        }
    }
}

function mobAtkPlayer() {
    var dmg = battleMob.atk - player.def;
    if (dmg < 0) {
        dmg = 0;
        newNotification('dmg is too low');
        console.log('dmg is too low');
    }
    player.curHp -= dmg;

    newNotification('player received ' + dmg + 'dmg from the mob');
    if (player.curHp <= 0) {
        // player is killed
        var exp = -10; //// temperary set to 10 for now, need to implement variable based on level difference.
        newNotification('player is dead');
        console.log('player is dead');
        player.addExp(exp);
        player.disEngageBattle(canvas.width * 0.05);
        displayQn = false;
        resetKeys();
        curGameState = gameStates[0];
    }
}

function chooseAnsOption(e) {
    touchEndX = e.touches[0].clientX;
    touchEndY = e.touches[0].clientY;
    if (touchEndX > optX && touchEndY > optY) {
        if (touchEndY < optY + optH) {
            // first option
            ansOptIndex = 0;
        }
        if (touchEndY >= optY + optH && touchEndY < optY + optH * 2) {
            // second option
            ansOptIndex = 1;
        }
        if (touchEndY >= optY + optH * 2 && touchEndY < optY + optH * 3) {
            // second option
            ansOptIndex = 2;
        }
        if (touchEndY >= optY + optH * 3 && touchEndY < optY + optH * 4) {
            // second option
            ansOptIndex = 3;
        }
    }
    window.addEventListener("touchend", selectOption);
}

function selectOption(e) {
    window.removeEventListener("touchmove", trackTouchMove);
    if (touchEndX > optX && touchEndY > optY) {
        if (touchEndY < optY + optH) {
            // first option
            ansOptIndex = 0;
        }
        if (touchEndY >= optY + optH && touchEndY < optY + optH * 2) {
            // second option
            ansOptIndex = 1;
        }
        if (touchEndY >= optY + optH * 2 && touchEndY < optY + optH * 3) {
            // second option
            ansOptIndex = 2;
        }
        if (touchEndY >= optY + optH * 3 && touchEndY < optY + optH * 4) {
            // second option
            ansOptIndex = 3;
        }
        ansOptSelected = ansOpts[ansOptIndex];
        // validate answer option vs correct index
        answerCorrect = ansOptIndex == indexOfAns;
        if (curAction == actions[0]) {
            if (answerCorrect) {
                newNotification('Correct! Critical!');
                attackMob(battleMob, true);
            } else {
                newNotification('Wrong');
                newNotification('The answer is: ' + ans);
                attackMob(battleMob, false);
            }
        }
        if (curAction == actions[1]) {
            if (answerCorrect) {
                newNotification('Correct! Critical!');
                magicMob(player, battleMob, true);
            } else {
                newNotification('Wrong');
                newNotification('The answer is: ' + ans);
                magicMob(player, battleMob, false);
            }
        }
        qnEnd = Date.now();
        save_progress(subject, op, qn, ans, ansOptSelected, answerCorrect, qnEnd - qnStart);
        displayQn = false;
    }
    window.removeEventListener("touchend", selectOption);
}

function chooseActionOption(e) {
    touchEndX = e.touches[0].clientX;
    touchEndY = e.touches[0].clientY;

    if (touchEndY > actionBoxY) {
        if (touchEndX < actionOptionBoxW) {
            // Attack is clicked
            curActionIndex = 0;
        }
        if (touchEndX >= actionOptionBoxW && touchEndX < actionOptionBoxW * 2) {
            curActionIndex = 1;
        }
        if (touchEndX >= actionOptionBoxW * 2) {
            // escape is selected
            // cur displaying action selection, return to explore state
            curActionIndex = 2;
        }
    }
    window.addEventListener("touchend", selectAction);
}

function selectAction(e) {
    window.removeEventListener("touchmove", chooseActionOption);
    if (touchEndY > actionBoxY) {
        if (touchEndX < actionOptionBoxW) {
            // Attack is clicked
            curActionIndex = 0;
        }
        if (touchEndX >= actionOptionBoxW && touchEndX < actionOptionBoxW * 2) {
            curActionIndex = 1;
        }
        if (touchEndX >= actionOptionBoxW * 2) {
            // escape is selected
            // cur displaying action selection, return to explore state
            curActionIndex = 2;
        }
        curAction = actions[curActionIndex];

        if (curActionIndex == 0 || curActionIndex == 1) {
            // atk or magic is selected
            createQnBox();
            displayQn = true;
        }
        if (curActionIndex == 2) {
            // escape is selected
            player.disEngageBattle(canvas.width * 0.05);
            battleMob.disEngageBattle(canvas.width * 0.05);
            mobs.push(battleMob);
            resetKeys();
            curGameState = gameStates[0];
        }
    }
    window.removeEventListener("touchend", selectAction);
}

function trackTouchMove(e) {
    touchDetected = true;
    touchEndX = e.touches[0].clientX - firstTouchX;
    touchEndY = e.touches[0].clientY - firstTouchY;
    touchArrowW = canvas.width * 0.1;
    touchArrowH = touchArrowW / touchArrowImg.width * touchArrowImg.height;
    if (touchEndX > 0) {
        touchRotateRadians = Math.atan(touchEndY / touchEndX);
    } else {
        touchRotateRadians = Math.atan(touchEndY / touchEndX) + 2;
    }

    if (curGameState === gameStates[0] && trackMove == true) {
        player.moving = true;
        if (touchEndX > 0) {
            keys["ArrowLeft"] = false;
            keys["ArrowRight"] = true;
        }
        if (touchEndX < 0) {
            keys["ArrowLeft"] = true;
            keys["ArrowRight"] = false;
        }
        if (touchEndY > 0) {
            keys["ArrowUp"] = false;
            keys["ArrowDown"] = true;
        }
        if (touchEndY < 0) {
            keys["ArrowUp"] = true;
            keys["ArrowDown"] = false;
        }
    }

    if (curGameState === gameStates[1]) {
        if (displayQn === true) {
            touchEndX = e.touches[0].clientX;
            touchEndY = e.touches[0].clientY;


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

function disableMove(e) {
    touchDetected = false;
    window.removeEventListener("touchmove", trackTouchMove);
    if (curGameState === gameStates[0]) {
        trackMove = false
        player.moving = false;
        keys["ArrowRight"] = false;
        keys["ArrowLeft"] = false;
        keys["ArrowDown"] = false;
        keys["ArrowUp"] = false;
    }
    window.removeEventListener("touchend", disableMove);
}

window.addEventListener("touchstart", function(e) {
    e.preventDefault();
    touch = e.touches[0];
    firstTouchX = touch.clientX;
    firstTouchY = touch.clientY;
    if (firstTouchX > helpX && firstTouchX < helpX + helpW && firstTouchY > helpY && firstTouchY < helpY + helpH) {
        // click is in the help icon area
        if (displayHelp == true) {
            displayHelp = false;
            for (i = 0; i < mobs.length; i++) {
                mobs[i].moving = true;
            }
        } else {
            displayHelp = true;
            for (i = 0; i < mobs.length; i++) {
                mobs[i].moving = false;
            }
        }
    }
    if (firstTouchX > charInfoX && firstTouchX < charInfoX + charInfoW && firstTouchY > charInfoY && firstTouchY < charInfoY + charInfoH) {
        // click is in the char icon area
        if (displayCharInfo == true) {
            displayCharInfo = false;
            for (i = 0; i < mobs.length; i++) {
                mobs[i].moving = true;
            }
        } else {
            displayCharInfo = true;
            for (i = 0; i < mobs.length; i++) {
                mobs[i].moving = false;
            }
        }
    }
    if (firstTouchX > saveX && firstTouchX < saveX + saveW && firstTouchY > saveY && firstTouchY < saveY + saveH) {
        // click is in the save icon area
        save_character(player);
    }
    touchEndX = firstTouchX;
    touchEndY = firstTouchY;
    if (curGameState === gameStates[0]) {
        trackMove = true;
        window.addEventListener("touchmove", trackTouchMove);
        window.addEventListener("touchend", disableMove);
    }
    if (curGameState === gameStates[1]) {
        // Battle state
        if (displayQn === true) {
            window.addEventListener("touchmove", chooseAnsOption);
            window.addEventListener("touchend", selectOption);
        } else {
            window.addEventListener("touchmove", chooseActionOption)
            window.addEventListener("touchend", selectAction);
        }
    }
}, { passive: false })

function save_progress(sub, op, qn, ans, ansChosen, result, duration) {
    progressObj = {
        subject: sub,
        result: result,
        operation: op,
        question: qn,
        correctAnswer: ans,
        ansChosen: ansChosen,
        duration: duration,
    }
    fetch('/save_progress', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(progressObj),
    });
}

function save_character(char) {
    var char_object = {
        id: char.id,
        character: JSON.stringify(char),
    };
    fetch('/game/save_character', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(char_object),
    });
    retrieve_characters();
}

function retrieve_characters() {
    var fetch_url = "/game/load_characters";
    savedCharacters = [];
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
            console.log('char_obj retrieved from server')
            console.log("char id: " + char.id)
                // console.log("char detail: " + char.character);
            if (char.id == -1) {
                console.log("NO Saved Char Loaded")
            } else {
                var character = JSON.parse(char.character);
                character.id = char.id;
                match_char_attributes(player, character);
                console.log("Char Loaded with char ID: " + String(player.id));
            }
        })
        .catch(error => console.log('ERROR LOAD CHARACTERS: ' + error))
}

function match_char_attributes(char, saved_char) {
    char.id = saved_char.id;

    // player game attribute
    char.name = saved_char.name;
    char.lvl = saved_char.lvl;
    char.maxHp = saved_char.maxHp;
    char.maxMp = saved_char.maxMp;
    char.curHp = saved_char.curHp;
    char.curMp = saved_char.curMp;
    char.maxExp = saved_char.maxExp;
    char.curExp = saved_char.curExp;
    char.atk = saved_char.atk;
    char.def = saved_char.def;
    char.gold = saved_char.gold;
    char.inv = saved_char.inv;

    // return char;
}