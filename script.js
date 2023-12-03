const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const dieOutcomeDisplay = document.getElementById('dieOutcome');
const specialMessage = document.getElementById('specialMessage');

let scale = 20;
let rows = canvas.height / scale;
let columns = canvas.width / scale;

let snake;
let fruit;
let gameLoop;

const quantum = {
    getRandom: function(min, mid, max) {
        const buffer = new Uint32Array(1);
        window.crypto.getRandomValues(buffer);
        const normalizedRandom = buffer[0] / (0xFFFFFFFF + 1);

        if (normalizedRandom < 0.33) {
            return this.cryptoRandom(min, mid);
        } else if (normalizedRandom < 0.67) {
            return this.cryptoRandom(mid, max);
        } else {
            return this.cryptoRandom(max, max + (max - mid));
        }
    },
    cryptoRandom: function(min, max) {
        const range = max - min;
        const buffer = new Uint32Array(1);
        window.crypto.getRandomValues(buffer);
        return (buffer[0] / (0xFFFFFFFF + 1)) * range + min;
    }
};

function rollQuantumDie() {
    let outcome = quantumDieOutcome();
    dieOutcomeDisplay.textContent = outcome;
    applyDieEffect(outcome);
}

function quantumDieOutcome() {
    const result = quantum.getRandom(0, 1, 2);
    if (result < 1) {
        return 'H';
    } else if (result < 2) {
        return '𝕏';
    } else {
        return '+';
    }
}

function applyDieEffect(outcome) {
    switch(outcome) {
        case 'H':
            snake.grow();
            break;
        case '𝕏':
            snake.speedUp();
            break;
        case '+':
            snake.addScoreBonus();
            break;
    }
}

class Snake {
    constructor() {
        this.body = [{ x: scale * 5, y: scale * 5 }];
        this.xSpeed = scale * 1;
        this.ySpeed = 0;
        this.total = 0;
        this.speed = 250;
    }

    draw() {
        ctx.fillStyle = "#00FF00";
        for (let i = 0; i < this.body.length; i++) {
            ctx.fillRect(this.body[i].x, this.body[i].y, scale, scale);
        }
    }

    update() {
        for (let i = this.body.length - 2; i >= 0; i--) {
            this.body[i + 1] = { ...this.body[i] };
        }

        this.body[0].x += this.xSpeed;
        this.body[0].y += this.ySpeed;

        if (this.body[0].x >= canvas.width) {
            this.body[0].x = 0;
        } else if (this.body[0].x < 0) {
            this.body[0].x = canvas.width;
        }

        if (this.body[0].y >= canvas.height) {
            this.body[0].y = 0;
        } else if (this.body[0].y < 0) {
            this.body[0].y = canvas.height;
        }
    }

    changeDirection(direction) {
        switch(direction) {
            case 'Up':
                if (this.ySpeed === 0) {
                    this.xSpeed = 0;
                    this.ySpeed = -scale * 1;
                }
                break;
            case 'Down':
                if (this.ySpeed === 0) {
                    this.xSpeed = 0;
                    this.ySpeed = scale * 1;
                }
                break;
            case 'Left':
                if (this.xSpeed === 0) {
                    this.xSpeed = -scale * 1;
                    this.ySpeed = 0;
                }
                break;
            case 'Right':
                if (this.xSpeed === 0) {
                    this.xSpeed = scale * 1;
                    this.ySpeed = 0;
                }
                break;
        }
    }

    eat(fruit) {
        if (this.body[0].x === fruit.x && this.body[0].y === fruit.y) {
            this.total++;
            this.body.push({ x: this.body[this.body.length - 1].x, y: this.body[this.body.length - 1].y });
            return true;
        }

        return false;
    }

    checkCollision() {
        for (let i = 1; i < this.body.length; i++) {
            if (this.body[i].x === this.body[0].x && this.body[i].y === this.body[0].y) {
                this.total = 0;
                this.body = [{ x: scale
