import {Color, Palette} from "./types.js"

// quantize the image to the given number of colors.
export function quantize(image, numColors, maxKMeansIterations) {
    const colors = [];
    image.forEach((color) => {
        colors.push(color);
    })
    const centroids = kmeans(colors, numColors, maxKMeansIterations);
    return new Palette(centroids);
}

// kmeans implements a naive k-means algorithm.
function kmeans(data, k, maxIterations) {
    // Choose the initial set of centroids.
    let centroids = [];
    for (let i = 0; i < k; i++) {
        centroids.push(data[Math.floor(Math.random() * data.length)]);
    }

    // Iterate until we converge on the optimal set of centroids.
    for (let i = 0; i < maxIterations; i++) {
        console.log("iteration " + i);
        const oldCentroids = centroids;
        const nearestCentroids = data.map((color) => findClosestCentroid(color, centroids));
        centroids = computeNewCentroids(data, nearestCentroids, centroids);
        if (arrsEqual(centroids, oldCentroids)) {
            return centroids
        }
    }
    return centroids;
}

function arrsEqual(a, b) {
    if (a.length != b.length) {
        return false
    }
    return a.every((_, index) => a[index].equal(b[index]));
}

function findClosestCentroid(color, centroids) {
    let minDist = -1;
    let closestIdx = 0;
    centroids.forEach((centroid, index) => {
        const dist = color.sqDist(centroid);
        if (minDist < 0 || dist < minDist) {
            minDist = dist;
            closestIdx = index;
        }
    });
    return closestIdx;
}

function computeNewCentroids(data, nearestCentroids, centroids) {
    const sums = centroids.map(() => new Color(0, 0, 0, 255));
    const counts = centroids.map(() => 0);
    data.forEach((color, index) => {
        const nearestIdx = nearestCentroids[index];
        const sum = sums[nearestIdx];
        sum.r += color.r;
        sum.g += color.g;
        sum.b += color.b;
        counts[nearestIdx]++;
    });

    return counts.map((count, index) => {
        if (count == 0) {
            return centroids[index];
        } else {
            const sum = sums[index];
            sum.r = Math.round(sum.r / count);
            sum.g = Math.round(sum.g / count);
            sum.b = Math.round(sum.b / count);
            return sum;
        }
    })
}
