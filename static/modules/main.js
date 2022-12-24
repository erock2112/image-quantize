import {applyPalette, drawPalette, fromImageData} from "./palette.js";

class App{
    constructor() {
        this._numColors = 8;
        this._imageData = null;
    }

    get numColors() {
        return this._numColors;
    }
    set numColors(numColors) {
        this._numColors = numColors;
        this.render();
    }

    get imageData() {
        return this._imageData;
    }
    set imageData(imageData) {
        this._imageData = imageData;
        this.render();
    }

    render() {
        imageDataToCanvas("src-image", this.imageData);

        // Quantize the image.
        console.log("computing quantized palette");
        const numColors = document.getElementById("size-input").value;
        const quantizedPalette = fromImageData(this.imageData, this.numColors, 1000);
        const quantizedPaletteImage = drawPalette(quantizedPalette);
        imageDataToCanvas("src-palette", quantizedPaletteImage);
        const quantizedImageData = applyPalette(this.imageData, quantizedPalette);
        imageDataToCanvas("quantized-image", quantizedImageData);
    }
}

function imageDataToCanvas(canvasId, imageData) {
    var canvas = document.getElementById(canvasId);
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    var ctx = canvas.getContext("2d");
    ctx.putImageData(imageData, 0, 0);
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
        app.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    });
    document.getElementById("size-input").onchange = (event) => {
        app.numColors = event.target.value;
    };
}

const app = new App();
init();