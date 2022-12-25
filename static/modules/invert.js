import {Color, Image} from "./types.js"

export function invert(image) {
    const result = Image.withDimensions(image.width, image.height);
    image.forEach((color, x, y) => {
        result.set(x, y, new Color(
            255 - color.r,
            255 - color.g,
            255 - color.b,
            255,
        ))
    });
    return result;
}