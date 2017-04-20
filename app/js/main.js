class Background {
    /**
     * @namespace 
     * @property {HTMLCanvasElement} this.canvas
     */
    
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {Image} image
     */
    constructor(canvas, image){
        this.canvas = canvas;
        this.image = image;
        this.offset = 0;
    }

    /**
     * @param {CanvasRenderingContext2D} canvas
     */
    draw(canvas){
        let screenHeight = this.canvas.height;
        let screenWidth = this.canvas.width;
        let background = this.image;
        let scale = this.getScale();
        let scaledWidth = background.width / scale;
        let x = -this.offset;
        while (x < screenWidth) {
            canvas.drawImage(background, x, 0, scaledWidth, screenHeight);
            x += scaledWidth;
        }
    }

    /**
     *
     */
    update(moving){
        if (!moving) return;
        this.offset += this.canvas.width / 1000.0;
        let scaledWidth = this.image.width / this.getScale();
        while (scaledWidth < this.offset) {
            this.offset -= scaledWidth;
        }
    }
    
    /**
     * @returns {Number}
     */
    getScale() {
        return this.image.height / this.canvas.height;
    }
}

class Balloon {
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {Image} image
     */
    constructor(canvas, image){
        this.canvas = canvas;
        this.image = image;
        this.altitude = 100;
        this.temperature = 2;
        this.heating = 0.01;
        this.cooling = 0.02;
    }

    /**
     * @param {CanvasRenderingContext2D} canvas
     */
    draw(canvas){
        let balloonImage = this.image;
        let scale = this.getScale();
        let height = balloonImage.height / scale;
        let y = this.canvas.height - height - this.altitude;
        let x = this.image.width / scale;
        canvas.drawImage(balloonImage, x, y, 
                         balloonImage.width / scale, height);
        canvas.fillText(this.temperature, 2 * x, y + height -  height / 5);
        canvas.fillText(this.heating, 2 * x, y + height - height / 10);
    }

    /**
     *
     */
    update(){
        let scale = this.getScale();
        let scaledBalloonHeight = this.image.height / scale;
        let g = 9.8;
        let mass = 10;
        let gravity = mass * g * g;
        let maxAltApproach = this.canvas.height - this.altitude;
        if (maxAltApproach < 0) maxAltApproach = 0;
        maxAltApproach -= scaledBalloonHeight / 2;
        let density = 1 + maxAltApproach * this.temperature / 1000.0;
        let volume = 50;
        let archimedes = volume * density * g;
        let a = (archimedes - gravity) / mass;
        let dy = a / 10.0;
        if (this.altitude > 0 || dy > 0) {
            this.altitude += dy;
        }
        let lowest = this.temperature > 0 || this.heating > this.cooling;
        let highest = this.temperature < 10 || this.heating < this.cooling;
        if (lowest && highest) {
            this.temperature += this.heating - this.cooling;
        }
        if (this.heating > 0) this.heating -= 0.001;
    }
    
    /**
     * @returns {Number}
     */
    getScale() {
        return 0.5;
    }
}


class Game {    
    constructor() {
    }

    /**
     * @param {HTMLCanvasElement} canvas
     */
    play(canvas){
        let context = canvas.getContext('2d');
        let coinImage = new Image();
        let balloonImage = new Image();
        let backgroundImage = new Image();
        backgroundImage.addEventListener('load', () => {
            canvas.width = backgroundImage.naturalWidth;
            canvas.height = backgroundImage.naturalHeight;
            balloonImage.addEventListener('load', () => {
                let background = new Background(canvas, backgroundImage);
                this.balloon = new Balloon(canvas, balloonImage);
                let moving = true;
                let gameLoop = () => {
                    // update
                    moving = this.balloon.altitude > 0;
                    background.update(moving);
                    this.balloon.update();
                    // draw
                    background.draw(context);
                    this.balloon.draw(context);
                    // context.drawImage(coinImage, 500, 500, coinImage.width / 5, coinImage.height / 5);
                    // context.drawImage(coinImage, 600, 600, coinImage.width / 5, coinImage.height / 5);
                    // context.drawImage(coinImage, 700, 500, coinImage.width / 5, coinImage.height / 5);
                    // context.drawImage(coinImage, 800, 600, coinImage.width / 5, coinImage.height / 5);
                    // context.drawImage(coinImage, 900, 500, coinImage.width / 5, coinImage.height / 5);
                };
                window.setInterval(gameLoop, 1000 / 60);
            }, false);
            balloonImage.src = 'img/balloon.svg';
            coinImage.src = 'img/coin.png';
        }, false);
        backgroundImage.src = 'img/bg.jpg';
    }
}

// width height for screen