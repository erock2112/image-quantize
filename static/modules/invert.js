import {Color} from "./types.js"

export function invert(image) {
    return image.map((color) => new Color(
        255 - color.r,
        255 - color.g,
        255 - color.b,
        255,
    ));
}