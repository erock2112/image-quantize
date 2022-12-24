export class Color {
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    toPoint() {
        return [this.r, this.g, this.b];
    }

    sqDist(other) {
        return [other.r - this.r, other.g - this.g, other.b - this.b]
            .map((diff) => diff * diff)
            .reduce((sum, sq) =>  sum + sq);
    }
}

export class Image {
    constructor(imageData) {
        this.imageData = imageData;
    }

    static withDimensions(width, height) {
        return new Image(new ImageData(width, height));
    }

    index(x, y) {
        return (y * this.width + x) * 4;
    }

    get(x, y) {
        const startIndex = this.index(x, y);
        return new Color(
            this.imageData.data[startIndex + 0],
            this.imageData.data[startIndex + 1],
            this.imageData.data[startIndex + 2],
            this.imageData.data[startIndex + 3],
        );
    }

    set(x, y, color) {
        const startIndex = this.index(x, y);
        this.imageData.data[startIndex + 0] = color.r;
        this.imageData.data[startIndex + 1] = color.g;
        this.imageData.data[startIndex + 2] = color.b;
        this.imageData.data[startIndex + 3] = color.a;
    }

    get width() {
        return this.imageData.width;
    }
    get height() {
        return this.imageData.height;
    }

    forEach(callback) {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                callback(this.get(x, y), x, y);
            }
        }
    }

    draw(canvas) {
        canvas.width = this.imageData.width;
        canvas.height = this.imageData.height;
        var ctx = canvas.getContext("2d");
        ctx.putImageData(this.imageData, 0, 0);
    }
}

export class Palette {
    constructor(colors) {
        this.colors = colors;
    }

    nearest(color) {
        let minDist = -1;
        let closestColor = this.colors[0];
        this.colors.forEach((paletteColor) => {
            const dist = color.sqDist(paletteColor);
            if (minDist < 0 || dist < minDist) {
                minDist = dist;
                closestColor = paletteColor;
            }
        });
        return closestColor;
    }

    apply(image) {
        const result = Image.withDimensions(image.width, image.height);
        image.forEach((srcColor, x, y) => {
            const dstColor = this.nearest(srcColor);
            result.set(x, y, dstColor);
        })
        return result;
    }

    makeImage(blockWidthPixels) {
        const image = Image.withDimensions(blockWidthPixels, blockWidthPixels * this.colors.length);
        this.colors.forEach((color, index) => {
            const yOffset = index * blockWidthPixels;
            for (let x = 0; x < blockWidthPixels; x++) {
                for (let y = yOffset; y < yOffset + blockWidthPixels; y++) {
                    image.set(x, y, color);
                }
            }
        });
        return image;
    }
}