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
    update(){
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

class Game {    
    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas) {
        this.canvas = canvas;
    }

    static play(canvas){
        let game = new Game(canvas);
        let context = canvas.getContext('2d');
        let backgroundImage = new Image();
        backgroundImage.addEventListener('load', ()=>{
            let background = new Background(canvas, backgroundImage);
            let gameLoop = () => {
                background.update();
                background.draw(context);
                window.setTimeout(gameLoop, 1000 / 25);
            }
            window.setTimeout(gameLoop, 1000 / 25);
        }, false);
        backgroundImage.src = 'img/bg.jpg';        
    }
}

// width height for screen