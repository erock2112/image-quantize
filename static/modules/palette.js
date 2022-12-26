import { Color, Palette } from "./types.js";

export function monochrome(src, steps) {
    if (steps == 0) {
        return [];
    } else if (steps == 1) {
        return [src];
    }
    const palette = [];
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
    return new Palette(palette);
}
