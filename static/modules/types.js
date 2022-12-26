export class Color {
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    static fromHex(hex) {
        const components = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
        if (!components) {
            throw `invalid hex value "${hex}"`;
        }
        return new Color(parseInt(components[1], 16), parseInt(components[2], 16), parseInt(components[3], 16), 255);
    }

    toHex() {
        const componentToHex = (component) => component.toString(16).padStart(2, "0");
        return `#${componentToHex(this.r)}${componentToHex(this.g)}${componentToHex(this.b)}`
    }

    sqDist(other) {
        return [other.r - this.r, other.g - this.g, other.b - this.b]
            .map((diff) => diff * diff)
            .reduce((sum, sq) =>  sum + sq);
    }

    equal(other) {
        return this.r === other.r && this.g === other.g && this.b === other.b && this.a === other.a;
    }

    luminosity() {
        return Math.round(0.3 * this.r + 0.59 * this.g + 0.11 * this.b);
    }

    invert() {
        return new Color(
            255 - this.r,
            255 - this.g,
            255 - this.b,
            255,
        )
    }

    greyscale() {
        const luminosity = this.luminosity();
        return new Color(luminosity, luminosity, luminosity, this.a);
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

    map(callback) {
        const result = Image.withDimensions(this.width, this.height);
        this.forEach((color, x, y) => {
            result.set(x, y, callback(color, x, y));
        });
        return result;
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