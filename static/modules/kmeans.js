// kmeans implements a naive k-means algorithm.
export function kmeans(data, k, maxIterations) {
    // Validate the input data.
    let dimensions = -1;
    console.log(data);
    data.forEach((pt) => {
        if (dimensions == -1) {
            dimensions = pt.length;
        } else {
            if (pt.length != dimensions) {
                throw `provided data does not have uniform dimensions, found ${pt.length} and ${dimensions}`;
            }
        }
    });

    // Choose the initial set of centroids.
    let centroids = [];
    for (let i = 0; i < k; i++) {
        centroids.push(data[Math.floor(Math.random() * data.length)]);
    }

    // Iterate until we converge on the optimal set of centroids.
    for (let i = 0; i < maxIterations; i++) {
        console.log(centroids);
        console.log("iteration " + i);
        const oldCentroids = centroids;
        const nearestCentroids = data.map((pt) => findClosestCentroid(pt, centroids));
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
    return a.every((_, index) => equal(a[index], b[index]));
}

function findClosestCentroid(pt, centroids) {
    let minDist = -1;
    let closestIdx = 0;
    centroids.forEach((centroid, index) => {
        const dist = sqDist(pt, centroid);
        if (minDist < 0 || dist < minDist) {
            minDist = dist;
            closestIdx = index;
        }
    });
    return closestIdx;
}

function computeNewCentroids(data, nearestCentroids, centroids) {
    const sums = centroids.map(() => data[0].map(() => 0));
    const counts = centroids.map(() => 0);
    data.forEach((pt, index) => {
        const nearestIdx = nearestCentroids[index];
        add(sums[nearestIdx], pt);
        counts[nearestIdx]++;
    });

    return counts.map((count, index) => {
        if (count == 0) {
            return centroids[index];
        } else {
            const sum = sums[index];
            divide(sum, count);
            return sum;
        }
    })
}

function assertSameLength(a, b) {
    if (a.length != b.length) {
        throw `${a} has different length from ${b}`;
    }
}

export function sqDist(a, b) {
    assertSameLength(a, b);
    return a
        .map((ele, index) => b[index] - ele)
        .map((diff) => diff * diff)
        .reduce((sum, sq) =>  sum + sq);
}

export function add(a, b) {
    assertSameLength(a, b);
    a.forEach((_, index) => a[index] += b[index]);
}

export function divide(pt, scalar) {
    // Round to the nearest whole number; this helps us converge faster,
    // and we're not going to use fractional RGB values anyway.
    pt.forEach((_, index) => { pt[index] = Math.round(pt[index] / scalar)});
}

export function equal(a, b) {
    assertSameLength(a, b);
    return a.every((_, index) => a[index] === b[index]);
}