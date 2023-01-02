import { hslToRgb, rgbToHsl, rgbToHsv } from "./elements/rgb-hsl-hsv.js";

export class Color {
    constructor(r, g, b, a) {
        this.r = Math.max(0, Math.min(r, 255));
        this.g = Math.max(0, Math.min(g, 255));
        this.b = Math.max(0, Math.min(b, 255));
        this.a = Math.max(0, Math.min(a, 255));
    }

    static random() {
        return new Color(
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
            255,
        );
    }

    static fromHex(hex) {
        const components = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
        if (!components) {
            throw `invalid hex value "${hex}"`;
        }
        return new Color(parseInt(components[1], 16), parseInt(components[2], 16), parseInt(components[3], 16), 255);
    }

    static fromHsl(h, s, l) {
        const rgb = hslToRgb(h, s, l);
        return new Color(rgb[0], rgb[1], rgb[2], 255);
    }

    static fromHsv(h, s, v) {
        const rgb = hsvToRgb(h, s, v);
        return new Color(rgb[0], rgb[1], rgb[2], 255);
    }

    static fromHsi(h, s, i) {
        while (h < 0) {
            h += 1;
        }
        while (h > 1) {
            h -= 1;
        }
        const h1 = h * 6;
        const z = 1 - Math.abs(h1 % 2 - 1);
        const c = (3 * i * s) / (1 + z);
        const x = c * z;
        let r1, g1, b1;
        if (h1 <= 1) {
            r1 = c;
            g1 = x;
            b1 = 0;
        } else if (h1 <= 2) {
            r1 = x;
            g1 = c;
            b1 = 0;
        } else if (h1 <= 3) {
            r1 = 0;
            g1 = c;
            b1 = x;
        } else if (h1 <= 4) {
            r1 = 0;
            g1 = x;
            b1 = c;
        } else if (h1 <= 5) {
            r1 = x;
            g1 = 0;
            b1 = c;
        } else {
            r1 = c;
            g1 = 0;
            b1 = x;
        }
        const m = i * (1 - s);
        return new Color(
            Math.round((r1 + m) * 255),
            Math.round((g1 + m) * 255),
            Math.round((b1 + m) * 255),
            255);
    }

    hex() {
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

    hsl() {
        return rgbToHsl(this.r, this.g, this.b);
    }

    hsv() {
        return rgbToHsv(this.r, this.g, this.b);
    }

    hsi() {
        const i = (this.r + this.g + this.b) / 3;
        const m = Math.min(this.r, this.g, this.b);
        let s = 0;
        if (i > 0) {
            s = 1 - (m / i);
        }
        let h = 0;
        const denom = Math.sqrt(this.r * this.r + this.g * this.g + this.b * this.b - this.r * this.g - this.r * this.b - this.g * this.b);
        if (denom > 0) {
            h = Math.acos((this.r - this.g / 2 - this.b / 2) / denom);
        }
        if (this.g < this.b) {
            h = 2 * Math.PI - h;
        }
        h = h / (2 * Math.PI);
        return [h, s, i / 255];
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

    sepia() {
        return new Color(
            (this.r * .393) + (this.g *.769) + (this.b * .189),
            (this.r * .349) + (this.g *.686) + (this.b * .168),
            (this.r * .272) + (this.g *.534) + (this.b * .131),
            this.a,
        );
    }

    string() {
        return `(${this.r}, ${this.g}, ${this.b})`;
    }

    blend(other, percent) {
        return new Color(
            this.r * (1 - percent) + other.r * percent,
            this.g * (1 - percent) + other.g * percent,
            this.b * (1 - percent) + other.b * percent,
            this.a * (1 - percent) + other.a * percent,
        );
    }
}

export const black = new Color(0, 0, 0, 255);
export const grey = new Color(127, 127, 127, 255);
export const white = new Color(255, 255, 255, 255);
export const red = new Color(255, 0, 0, 255);
export const green = new Color(0, 255, 0, 255);
export const blue = new Color(0, 0, 255, 255);

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
                callback(this.get(x, y), x, y, this.width, this.height);
            }
        }
    }

    map(callback) {
        const result = Image.withDimensions(this.width, this.height);
        this.forEach((color, x, y, width, height) => {
            result.set(x, y, callback(color, x, y, width, height));
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
        const dimensions = getDimensions(this.colors.length);
        const colorWidth = dimensions[0];
        const colorHeight = dimensions[1];
        const image = Image.withDimensions(blockWidthPixels * colorWidth, blockWidthPixels * colorHeight);
        this.colors.forEach((color, index) => {
            const offsetX = (index % colorWidth) * blockWidthPixels;
            const offsetY = Math.floor(index / colorWidth) * blockWidthPixels;
            for (let x = offsetX; x < offsetX + blockWidthPixels; x++) {
                for (let y = offsetY; y < offsetY + blockWidthPixels; y++) {
                    image.set(x, y, color);
                }
            }
        });
        return image;
    }

    get length() {
        return this.colors.length;
    }

    slice(start, end) {
        return new Palette(this.colors.slice(start, end));
    }

    map(cb) {
        return this.colors.map(cb);
    }

    forEach(cb) {
        this.colors.forEach(cb);
    }
}

export class PaletteMap {
    constructor(from, to) {
        if (to.length !== from.length) {
            throw `Palettes have differing lengths: ${to.length} vs ${from.length}`;
        }
        this.to = to;
        this.from = from;
    }

    get(color) {
        const index = this.from.findIndex((srcColor) => (
            srcColor.r == color.r
            && srcColor.g == color.g
            && srcColor.b == color.b
            && srcColor.a == color.a));
        if (index == -1) {
            console.log(`didn't find ${color.hex()} in ${this.from.map((c) => c.hex())}`)
            throw `Source color not found in source palette!`;
        }
        return this.to[index];
    }

    apply(image) {
        return image.map((color) => this.get(color));
    }

    static byLuminosity(from, to) {
        const fromSorted = from
            .map((color) => [color.luminosity(), color])
            .sort((a, b) => b[0] - a[0])
            .map((ele) => ele[1]);
        const toSorted = to
            .map((color) => [color.luminosity(), color])
            .sort((a, b) => b[0] - a[0])
            .map((ele) => ele[1]);
        return new PaletteMap(fromSorted, toSorted);
    }
}

function getDimensions(size) {
    const sqrt = Math.floor(Math.sqrt(size));
    for (let i = sqrt; i > 1; i--) {
        if (size % i == 0) {
            return [i, size / i];
        }
    }
    return [1, size];
}