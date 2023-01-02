import { interpolate, twoColorBw } from "./gradient.js";
import { Color, Palette, black, grey, white } from "./types.js";

export function monochrome(src, steps, includeBlack=true, includeWhite=true) {
    if (steps == 0) {
        return new Palette([]);
    } else if (steps == 1) {
        return new Palette([src]);
    }

    if (!includeBlack) {
        steps++;
    }
    if (!includeWhite) {
        steps++;
    }

    let palette = [];
    const baseLuminosity = src.luminosity();
    const ratioLeftR = src.r / baseLuminosity;
    const ratioLeftG = src.g / baseLuminosity;
    const ratioLeftB = src.b / baseLuminosity;
    const rightLuminositySpan = 255 - baseLuminosity;
    const ratioRightR = (255 - src.r) / rightLuminositySpan;
    const ratioRightG = (255 - src.g) / rightLuminositySpan;
    const ratioRightB = (255 - src.b) / rightLuminositySpan;
    const scale = 255 / (steps - 1);

    for (let i = 0; i < steps; i++) {
        const luminosity = i * scale;
        let r, g, b;
        if (luminosity < baseLuminosity) {
            r = luminosity * ratioLeftR;
            g = luminosity * ratioLeftG;
            b = luminosity * ratioLeftB
        } else {
            const luminosityAdj = luminosity - baseLuminosity;
            r = src.r + luminosityAdj * ratioRightR;
            g = src.g + luminosityAdj * ratioRightG;
            b = src.b + luminosityAdj * ratioRightB;
        }
        const color = new Color(Math.floor(r), Math.floor(g), Math.floor(b), 255);
        palette.push(color);
    }

    if (!includeBlack) {
        palette = palette.slice(1);
    }
    if (!includeWhite) {
        palette = palette.slice(0, palette.length - 1);
    }

    return new Palette(palette);
}

export function duotone(color1, color2, steps) {
    if (steps == 0) {
        return new Palette([]);
    } else if (steps == 1) {
        return new Palette([interpolate(color1, color2, 2, 1)]);
    } else if (steps == 2) {
        return new Palette([color1, color2]);
    }
    const colors = [];
    for (let i = 0; i < steps; i++) {
        colors.push(interpolate(color1, color2, steps-1, i));
    }
    return new Palette(colors);
}

export function duotoneSquare(color1, color2, steps) {
    const result = [];
    for (let x = 0; x < steps; x++) {
        for (let y = 0; y < steps; y++) {
            result.push(twoColorBw(color1, color2, x, y, steps-1, steps-1));
        }
    }
    return new Palette(result);
}

export function analogous(color) {
    const hsi = color.hsi();
    return tintsShadesPalette(new Palette([
        Color.fromHsi(hsi[0] - 1/12, hsi[1], hsi[2]),
        color,
        Color.fromHsi(hsi[0] + 1/12, hsi[1], hsi[2]),
    ]));
}

export function diad(color) {
    const hsi = color.hsi();
    return tintsShadesPalette(new Palette([
        color,
        Color.fromHsi(hsi[0] + 2/12, hsi[1], hsi[2]),
    ]));
}

export function complementary(color) {
    const hsi = color.hsi();
    return tintsShadesPalette(new Palette([
        color,
        Color.fromHsi(hsi[0] + 6/12, hsi[1], hsi[2]),
    ]));
}

export function splitComplementary(color) {
    const hsi = color.hsi();
    return tintsShadesPalette(new Palette([
        Color.fromHsi(hsi[0] - 5 / 12, hsi[1], hsi[2]),
        color,
        Color.fromHsi(hsi[0] + 5 / 12, hsi[1], hsi[2]),
    ]));
}

export function triadic(color) {
    const hsi = color.hsi();
    return tintsShadesPalette(new Palette([
        Color.fromHsi(hsi[0] - 4 / 12, hsi[1], hsi[2]),
        color,
        Color.fromHsi(hsi[0] + 4 / 12, hsi[1], hsi[2]),
    ]));
}

export function tintsShades(color) {
    return new Palette([
        color,
        color.blend(white, 0.5),
        color.blend(grey, 0.5),
        color.blend(black, 0.5),
    ]);
}

export function tintsShadesPalette(palette) {
    const colors = [];
    palette.colors.forEach((color) => {
        colors.push(...tintsShades(color).colors);
    });
    return new Palette(colors);
}