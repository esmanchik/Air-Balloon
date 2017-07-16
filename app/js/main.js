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
    update(state){
        if (!state.moving) return;
        state.speed = this.canvas.width / 1000.0
        this.offset += state.speed;
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
        this.lifes = 3;
    }

    alive() {
        return this.lifes > 0;
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
        let circle = this.getCollisionCircle();
//        canvas.beginPath();
//        canvas.arc(circle.x, circle.y, circle.radius, circle.radius, Math.PI * 2, true);
//        canvas.stroke();
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

    getCollisionCircle() {
        let scale = this.getScale();
        let height = this.image.height / scale;
        let width = this.image.width / scale;
        let r = width / 2;
        let cy = this.canvas.height - height - this.altitude + r;
        return {
            x: width + r, y: cy, radius: r
        }
    }
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

    that.update = function (state) {

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
        if (state.moving) {
            that.offset += state.speed;
        }
    };

    that.render = function () {

        // Draw the animation
        that.context.drawImage(that.image,
            frameIndex * that.width / numberOfFrames,
            0,
            that.width / numberOfFrames,
            that.height,
            canvas.width - that.offset,
            that.elevation,
            that.width / numberOfFrames,
            that.height);
    };

    that.collides = (balloon) => {
        let radius = that.height / 4;
        let x = canvas.width - that.offset + radius + radius / 1.5;
        let y = that.elevation + radius + radius / 1.5;
//                        that.context.beginPath();
//                        that.context.arc(x, y, radius, radius, Math.PI * 2, true);
//                        that.context.stroke();
        let circle = balloon.getCollisionCircle();
        let dx = x - circle.x;
        let dy = y - circle.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        return distance < radius + circle.radius;
    };

    return that;
}

class Coins {
    constructor(canvas, image) {
        this.canvas = canvas;
        this.image = image;
        this.coins = [];
        this.collected = 0;
        this.iteration = 0;
    }

    draw(canvas) {
        let coins = this.coins;
        for(let i = 0; i < coins.length; ++i) {
            let coin = coins[i];
            if (!coin) {
                continue;
            }
            coin.render();
        }
    }

    update(state) {
        let trim = 0;
        let coins = this.coins;
        for(let i = 0; i < coins.length; ++i) {
            let coin = this.coins[i];
            if (coin) break;
            ++trim;
        }
        if (trim > 0) coins = coins.slice(trim);
        for(let i = 0; i < coins.length; ++i) {
            let coin = coins[i];
            if (!coin) {
                continue;
            }
            if (coin.offset > this.canvas.width + coin.width) {
                coins[i] = null;
            }
            coin.update(state);
            if (coin.collides(state.balloon)) {
                ++state.collected;
                coins[i] = null;
                continue;
            }
        }

        if (this.iteration % 500 === 0) {
            let canvas = this.canvas;
            let coin = sprite({
                context: canvas.getContext("2d"),
                width: 973,
                height: 176,
                image: this.image,
                numberOfFrames: 7,
                ticksPerFrame: 4,
                elevation: Math.random() * canvas.height / 1.5,
                offset: Math.random() * canvas.width - canvas.width
            });
            coins.push(coin);
        }

        this.coins = coins;
        ++this.iteration;
    }
}

class Bombs {
    constructor(canvas, image) {
        this.canvas = canvas;
        this.image = image;
        this.items = [];
        this.iteration = 0;
    }

    draw(canvas) {
        let bombs = this.items;
        for(let i = 0; i < bombs.length; ++i) {
            let bomb = bombs[i];
            if (!bomb) {
                continue;
            }
            bomb.render();
        }
    }    

    update(state) {
        let trim = 0;
        let bombs = this.items;
        for(let i = 0; i <bombs.length; ++i) {
            let bomb = bombs[i];
            if (bomb) break;
            ++trim;
        }
        if (trim > 0) bombs = bombs.slice(trim);
        for(let i = 0; i < bombs.length; ++i) {
            let bomb = bombs[i];
            if (!bomb) {
                continue;
            }
            if (bomb.collides(state.balloon)) {
                bombs[i] = null;
                --state.balloon.lifes;
                continue;
            }
            bomb.update(state);
        }
        if (this.iteration % 500 === 0) {
            let canvas = this.canvas;
            let bomb = sprite({
                context: canvas.getContext("2d"),
                width: 846,
                height: 304,
                image: this.image,
                numberOfFrames: 3,
                ticksPerFrame: 4,
                elevation: Math.random() * canvas.height / 1.5,
                offset: Math.random() * canvas.width - canvas.width
            });
            bombs.push(bomb);
        }
        this.items = bombs;
        ++this.iteration;
    }
}

class Images {
    /**
     * @param {Array} srcs 
     */
    constructor(srcs) {
        let images = [];
        let i = 0;
        for(; i < srcs.length; ++i) {
            let image = new Image();
            images.push(image);
            let src = 'img/' + srcs[i];
            if (i > 0) {
                let prevImage = images[i - 1];
                prevImage.addEventListener('load', () => {
                    image.src = src;
                });
            } else {
                this.start = src;
            }
        }
        this.images = images;
    }

    /**
     * @param {Function} loaded
     */
    load(loaded) {
        let i = this.images.length;
        if (i > 0) {
            this.images[i - 1].addEventListener('load', loaded);
        }
        this.images[0].src = this.start;
    }

    get(index) {
        return this.images[index];
    }
}

class Game {
    constructor() {
    }

    /**
     * @param {HTMLCanvasElement} canvas
     */
    play(canvas) {
        let context = canvas.getContext('2d');
        let images = new Images([
            'bg.jpg', 'balloon.svg', 
            'coin_sprite.png', 'bomb_sprite.png',
            'coin-for-count.png', 'empty-heart.png', 'heart.png',
            'up-btn-gamescreen.png', 'settings-gamescreen.png', 
            'restart-gamescreen.png'
        ]);
        images.load(() => {
            var imid = 0;
            let backgroundImage = images.get(imid);
            let background = new Background(canvas, backgroundImage);
            canvas.width = backgroundImage.naturalWidth;
            canvas.height = backgroundImage.naturalHeight;

            this.balloon = new Balloon(canvas, images.get(++imid));
            this.coins = new Coins(canvas, images.get(++imid));
            this.bombs = new Bombs(canvas, images.get(++imid));

            let coinCounterImage = images.get(++imid);
            let emptyHeartImage = images.get(++imid);
            let fullHeartImage = images.get(++imid);

            let btnControllImage = images.get(++imid);
            let btnSettingImage = images.get(++imid);
            let btnRestartImage = images.get(++imid);

            this.balloon.lifes = 3;
            this.collected = 0;
            this.moving = true;
            this.speed = 1;
            let gameLoop = () => {
                // update
                this.moving = this.balloon.altitude > 0 && this.balloon.alive();
                background.update(this);
                this.balloon.update();
                this.coins.update(this);
                this.bombs.update(this);
                // draw
                background.draw(context);
                this.balloon.draw(context);
                this.coins.draw(context);
                this.bombs.draw(context);

                context.drawImage(emptyHeartImage, 50, 50, emptyHeartImage.width / 7, emptyHeartImage.height / 7);
                context.drawImage(emptyHeartImage, 100, 50, emptyHeartImage.width / 7, emptyHeartImage.height / 7);
                context.drawImage(emptyHeartImage, 150, 50, emptyHeartImage.width / 7, emptyHeartImage.height / 7);

                for (var i = 1; i <= this.balloon.lifes; ++i) {
                    context.drawImage(fullHeartImage, i*50, 50, fullHeartImage.width / 7, fullHeartImage.height / 7);
                }
                //context.drawImage(fullHeartImage, 100, 50, fullHeartImage.width / 7, fullHeartImage.height / 7);
                // context.drawImage(fullHeartImage, 150, 50, fullHeartImage.width / 7, fullHeartImage.height / 7);

                for (let i = 0; i < this.collected; ++i) {
                    context.drawImage(coinCounterImage, 400 + i * coinCounterImage.width / 21, 50, coinCounterImage.width / 7, coinCounterImage.height / 7);
                }

                context.drawImage(btnSettingImage, 1770, 150, btnSettingImage.width / 3.5, btnSettingImage.height / 3.5);
                context.drawImage(btnRestartImage, 1770, 50, btnRestartImage.width / 3.5, btnRestartImage.height / 3.5);
                context.drawImage(btnControllImage, 1600, 800, btnControllImage.width / 2, btnControllImage.height / 2);

                window.requestAnimationFrame(gameLoop);
            };
            window.requestAnimationFrame(gameLoop);
        });
    }
}