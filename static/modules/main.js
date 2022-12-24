import {applyPalette, drawPalette, fromImageData} from "./palette.js";

function readSrcImage(e) {
    var input = e.target;
    createImageBitmap(input.files[0]).then((bmp) => {
        console.log("reading image");
        // Draw the image into the src-image canvas.
        var canvas = document.createElement("canvas");
        canvas.width = bmp.width;
        canvas.height = bmp.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(bmp, 0, 0);
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        imageDataToCanvas("src-image", imageData);

        // Quantize the image.
        console.log("computing quantized palette");
        const quantizedPalette = fromImageData(imageData, 8, 1000);
        const quantizedPaletteImage = drawPalette(quantizedPalette);
        imageDataToCanvas("src-palette", quantizedPaletteImage);
        const quantizedImageData = applyPalette(imageData, quantizedPalette);
        imageDataToCanvas("quantized-image", quantizedImageData);
    })
}

function imageDataToCanvas(canvasId, imageData) {
    var canvas = document.getElementById(canvasId);
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    var ctx = canvas.getContext("2d");
    ctx.putImageData(imageData, 0, 0);
}

function init() {
    document.getElementById("file-input").onchange = readSrcImage;
}

init();