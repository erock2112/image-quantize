import {kmeans, sqDist} from "./kmeans.js";

class Color {
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    toPoint() {
        return [this.r, this.g, this.b];
    }
}

export function imageIndex(imageData, x, y) {
    return (y * imageData.width + x) * 4;
}

export function getPixel(imageData, x, y) {
    const startIndex = imageIndex(imageData, x, y);
    return new Color(
        imageData.data[startIndex + 0],
        imageData.data[startIndex + 1],
        imageData.data[startIndex + 2],
        imageData.data[startIndex + 3],
    );
}

export function setPixel(imageData, x, y, color) {
    const startIndex = imageIndex(imageData, x, y);
    imageData.data[startIndex + 0] = color.r;
    imageData.data[startIndex + 1] = color.g;
    imageData.data[startIndex + 2] = color.b;
    imageData.data[startIndex + 3] = color.a;
}

export function fromImageData(imageData, numColors, maxKMeansIterations) {
    const pixels = [];
    for (let x = 0; x < imageData.width; x++) {
        for (let y = 0; y < imageData.height; y++) {
            pixels.push(getPixel(imageData, x, y));
        }
    }
    const points = pixels.map((color) => [color.r, color.g, color.b]);
    const centroids = kmeans(points, numColors, maxKMeansIterations);
    return centroids.map((point) => new Color(point[0], point[1], point[2], 255));
}

export function drawPalette(palette) {
    const pixels = 50;
    const width = pixels;
    const height = pixels * palette.length;
    const imageData = new ImageData(width, height);
    palette.forEach((color, index) => {
        const yOffset = index * pixels;
        for (let x = 0; x < pixels; x++) {
            for (let y = yOffset; y < yOffset + pixels; y++) {
                setPixel(imageData, x, y, color);
            }
        }
    });
    return imageData;
}

export function nearestColor(color, palette) {
    let minDist = -1;
    let closestColor = palette[0];
    palette.forEach((paletteColor) => {
        const dist = sqDist(color.toPoint(), paletteColor.toPoint());
        if (minDist < 0 || dist < minDist) {
            minDist = dist;
            closestColor = paletteColor;
        }
    });
    return closestColor;
}

export function applyPalette(imageData, palette) {
    const result = new ImageData(imageData.width, imageData.height);
    for (let x = 0; x < imageData.width; x++) {
        for (let y = 0; y < imageData.height; y++) {
            const srcColor = getPixel(imageData, x, y);
            const dstColor = nearestColor(srcColor, palette);
            setPixel(result, x, y, dstColor);
        }
    }
    return result;
}