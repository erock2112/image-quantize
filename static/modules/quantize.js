import {Color, Palette} from "./types.js"
import {kmeans} from "./kmeans.js";

export function quantize(image, numColors, maxKMeansIterations) {
    const pixels = [];
    image.forEach((color) => {
        pixels.push(color);
    })
    const points = pixels.map((color) => [color.r, color.g, color.b]);
    const centroids = kmeans(points, numColors, maxKMeansIterations);
    return new Palette(centroids.map((point) => new Color(point[0], point[1], point[2], 255)));
}
