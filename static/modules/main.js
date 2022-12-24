import {Image} from "./types.js";
import {quantize} from "./quantize.js";

class App{
    constructor() {
        this._numColors = 4;
        this._image = null;
    }

    get numColors() {
        return this._numColors;
    }
    set numColors(numColors) {
        this._numColors = numColors;
        this.render();
    }

    get image() {
        return this._image;
    }
    set image(image) {
        this._image = image;
        this.render();
    }

    render() {
        if (!this._image) {
            return;
        }

        // Draw the original image to a canvas.
        imageDataToCanvas("src-image", this.image);

        // Quantize the image and draw both the generated palette and the
        // quantized image to canvases.
        console.log("computing quantized palette");
        const quantizedPalette = quantize(this.image, this.numColors, 1000);
        const quantizedPaletteImage = quantizedPalette.makeImage(50);
        imageDataToCanvas("src-palette", quantizedPaletteImage);
        const quantizedImageData = quantizedPalette.apply(this.image);
        imageDataToCanvas("quantized-image", quantizedImageData);
    }
}

function imageDataToCanvas(canvasId, image) {
    var canvas = document.getElementById(canvasId);
    image.draw(canvas);
}

function init() {
    document.getElementById("file-input").onchange = (event) => createImageBitmap(event.target.files[0]).then((bmp) => {
        // Draw the image into the src-image canvas.
        console.log("reading image");
        var canvas = document.createElement("canvas");
        canvas.width = bmp.width;
        canvas.height = bmp.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(bmp, 0, 0);
        app.image = new Image(ctx.getImageData(0, 0, canvas.width, canvas.height));
    });
    document.getElementById("size-input").onchange = (event) => {
        app.numColors = event.target.value;
    };
    document.getElementById("size-input").value = app.numColors;
}

const app = new App();
init();