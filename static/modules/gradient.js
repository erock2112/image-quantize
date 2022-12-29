import {Color} from "./types.js";

export function interpolate(color1, color2, tMax, t) {
    const p = t / tMax;
    const pInv = 1 - p;
    return new Color(
        color1.r * p + color2.r * pInv,
        color1.g * p + color2.g * pInv,
        color1.b * p + color2.b * pInv,
        color1.a * p + color2.a * pInv,
    );
}

export function vertical(color1, color2, x, y, width, height) {
    return interpolate(color1, color2, height, y);
}

export function horizontal(color1, color2, x, y, width, height) {
    return interpolate(color1, color2, width, x);
}

export function diagonal1(color1, color2, x, y, width, height) {
    return interpolate(color1, color2, 2, x/width + y/height);
}

export function diagonal2(color1, color2, x, y, width, height) {
    return interpolate(color1, color2, 2, (width-x)/width + y/height);
}

export function fourColor(color1, color2, color3, color4, x, y, width, height) {
    const mid1 = interpolate(color2, color1, width, x);
    const mid2 = interpolate(color3, color4, width, x);
    return interpolate(mid2, mid1, height, y);
}

export function twoColorBw(color1, color2, x, y, width, height) {
    return fourColor(new Color(0, 0, 0, 255), color1, new Color(255, 255, 255, 255), color2, x, y, width, height);
}