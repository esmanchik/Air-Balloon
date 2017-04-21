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
        // canvas.fillText(this.temperature, 2 * x, y + height -  height / 5);
        // canvas.fillText(this.heating, 2 * x, y + height - height / 10);
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
        let coinCounterImage = new Image();
        let bombImage = new Image();
        let emptyHeartImage = new Image();
        let fullHeartImage = new Image();
        let balloonImage = new Image();
        let btnSettingImage = new Image();
        let btnRestartImage = new Image();
        let btnControllImage = new Image();
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

                    context.drawImage(emptyHeartImage, 50, 50, emptyHeartImage.width / 7, emptyHeartImage.height / 7);
                    context.drawImage(emptyHeartImage, 100, 50, emptyHeartImage.width / 7, emptyHeartImage.height / 7);
                    context.drawImage(emptyHeartImage, 150, 50, emptyHeartImage.width / 7, emptyHeartImage.height / 7);

                    context.drawImage(fullHeartImage, 50, 50, fullHeartImage.width / 7, fullHeartImage.height / 7);
                    context.drawImage(fullHeartImage, 100, 50, fullHeartImage.width / 7, fullHeartImage.height / 7);
                    // context.drawImage(fullHeartImage, 150, 50, fullHeartImage.width / 7, fullHeartImage.height / 7);

                    context.drawImage(coinCounterImage, 850, 50, coinCounterImage.width / 7, coinCounterImage.height / 7);

                    context.drawImage(btnSettingImage, 1770, 150, btnSettingImage.width / 3.5, btnSettingImage.height / 3.5);
                    context.drawImage(btnRestartImage, 1770, 50, btnRestartImage.width / 3.5, btnRestartImage.height / 3.5);
                    context.drawImage(btnControllImage, 1600, 800, btnControllImage.width / 2, btnControllImage.height / 2);

                };
                window.setInterval(gameLoop, 1000 / 60);
            }, false);
            balloonImage.src = 'img/balloon.svg';

            coinImage.src = 'img/coin.png';
            coinCounterImage.src = 'img/coin-for-count.png';

            bombImage.src = 'img/bomb.png';

            emptyHeartImage.src = 'img/empty-heart.png';
            fullHeartImage.src = 'img/heart.png';

            btnSettingImage.src = 'img/restart-gamescreen.png';
            btnRestartImage.src = 'img/settings-gamescreen.png';
            btnControllImage.src = 'img/up-btn-gamescreen.png';

            (function () {

                let coin, coinImage, bomb, bombImage;

                function gameLoop () {

                    window.requestAnimationFrame(gameLoop);

                    coin.update();
                    coin.render();
                    bomb.update();
                    bomb.render();
                }

                function sprite (options) {

                    let that = {},
                        frameIndex = 0,
                        tickCount = 0,
                        ticksPerFrame = options.ticksPerFrame || 0,
                        numberOfFrames = options.numberOfFrames || 1;

                    that.context = options.context;
                    that.width = options.width;
                    that.height = options.height;
                    that.image = options.image;
                    that.elevation = options.elevation;
                    that.offset = options.offset || 0;

                    that.update = function () {

                        tickCount += 1;

                        if (tickCount > ticksPerFrame) {

                            tickCount = 0;

                            // If the current frame index is in range
                            if (frameIndex < numberOfFrames - 1) {
                                // Go to the next frame
                                frameIndex += 1;
                            } else {
                                frameIndex = 0;
                            }
                        }
                        that.offset += 1;
                    };

                    that.render = function () {

                        // Draw the animation
                        coin.context.drawImage(that.image,
                            frameIndex * that.width / numberOfFrames,
                            0,
                            that.width / numberOfFrames,
                            that.height,
                            canvas.width - that.offset,
                            that.elevation,
                            that.width / numberOfFrames,
                            that.height);
                    };

                    return that;
                }

                // Create sprite sheet
                coinImage = new Image();
                bombImage = new Image();

                // Create sprite
                coin = sprite({
                    context: canvas.getContext("2d"),
                    width: 138 * 7,
                    height: 200,
                    image: coinImage,
                    numberOfFrames: 7,
                    ticksPerFrame: 4,
                    elevation: 100
                });
                bomb = sprite({
                    context: canvas.getContext("2d"),
                    width: 846,
                    height: 304,
                    image: bombImage,
                    numberOfFrames: 3,
                    ticksPerFrame: 4,
                    elevation: 200,
                    offset: 500
                });

                // Load sprite sheet
                coinImage.addEventListener("load", gameLoop);
                coinImage.src = "img/coin_sprite.png";
                bombImage.addEventListener("load", gameLoop);
                bombImage.src = "img/bomb_sprite.png";

            } ());
        }, false);
        backgroundImage.src = 'img/bg.jpg';
    }
}