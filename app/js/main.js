class Background {
    /**
     * @param {Image} image
     */
    constructor(image){
       this.image = image;
    }

    /**
     * @param {CanvasRenderingContext2D} canvas
     */
    draw(canvas){
        let screenHeight = 720.0;
        let screenWidth = 1200.0;
        let scale = background.height / screenHeight;
        let scaledWidth = background.width/scale;
        canvas.drawImage(background, 0, 0, scaledWidth, screenHeight);
        if(scaledWidth < screenWidth){
            canvas.drawImage(background, scaledWidth, 0, scaledWidth, screenHeight);
        }
    }

    /**
     *
     */
    update(){

    }
}

class Game {
    /**
     * @param {CanvasRenderingContext2D} context
     */
    static play(context){

        let backgroundImage = new Image();
        backgroundImage.addEventListener('load', ()=>{
           let background = new Background(backgroundImage);
           background.draw(context);
        }, false);
        backgroundImage.src = 'img/bg.jpg';
    }
}

// width height for screen