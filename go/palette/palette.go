package palette

import (
	"image/color"
	"math"

	"github.com/erock2112/kmeans/go/kmeans"
)

// ColorToPoint converts a color.Color to a kmeans.Point.
// TODO: This function doesn't belong in this package.
func ColorToPoint(c color.Color) kmeans.Point {
	r, g, b, _ := c.RGBA()
	return kmeans.Point{int(r), int(g), int(b)}
}

// Monochrome creates a color.Palette by interpolating between black, white, and
// the given color, using the given number of steps.
func Monochrome(from color.Color, steps int) color.Palette {
	if steps == 0 {
		return []color.Color{}
	} else if steps == 1 {
		return []color.Color{from}
	}

	palette := make([]color.Color, 0, steps)
	srcR, srcG, srcB, _ := from.RGBA()

	// We'll divide the space between black and white into the given number of
	// steps, with the given color as the midpoint. Make sure that the side with
	// more steps is the one covering the greater distance.
	remainingSteps := uint32(steps) - 1
	stepsLeft := uint32(remainingSteps / 2)
	stepsRight := remainingSteps - stepsLeft
	distLeft := ColorToPoint(color.Black).SqDist(ColorToPoint(from))
	distRight := ColorToPoint(color.White).SqDist(ColorToPoint(from))
	if stepsLeft > stepsRight && distLeft < distRight {
		stepsLeft, stepsRight = stepsRight, stepsLeft
	}

	scaleLeftR := srcR / stepsLeft
	scaleLeftG := srcG / stepsLeft
	scaleLeftB := srcB / stepsLeft
	for i := uint32(0); i < stepsLeft; i++ {
		c := color.RGBA{
			R: uint8((i * scaleLeftR) >> 8),
			G: uint8((i * scaleLeftG) >> 8),
			B: uint8((i * scaleLeftB) >> 8),
			A: math.MaxUint8,
		}
		palette = append(palette, c)
	}

	scaleRightR := (math.MaxUint16 - srcR) / stepsRight
	scaleRightG := (math.MaxUint16 - srcG) / stepsRight
	scaleRightB := (math.MaxUint16 - srcB) / stepsRight
	for i := uint32(0); i <= stepsRight; i++ {
		c := color.RGBA{
			R: uint8((srcR + i*scaleRightR) >> 8),
			G: uint8((srcG + i*scaleRightG) >> 8),
			B: uint8((srcB + i*scaleRightB) >> 8),
			A: math.MaxUint8,
		}
		palette = append(palette, c)
	}
	return palette
}

// Subdivide creates a color.Palette by subdividing the three-dimensional RGB
// space the given number of times in each direction, resulting in a palette
// with divisions^3 colors.
func Subdivide(divisions int) color.Palette {
	palette := []color.Color{}
	if divisions == 0 {
		return palette
	} else if divisions == 1 {
		return []color.Color{
			color.RGBA{R: uint8(0), G: uint8(0), B: uint8(0), A: uint8(255)},
		}
	}
	scale := 255 / (divisions - 1)
	for r := 0; r < divisions; r++ {
		rVal := r * scale
		for g := 0; g < divisions; g++ {
			gVal := g * scale
			for b := 0; b < divisions; b++ {
				bVal := b * scale
				c := color.RGBA{
					R: uint8(rVal),
					G: uint8(gVal),
					B: uint8(bVal),
					A: 255,
				}
				palette = append(palette, c)
			}
		}
	}
	return palette
}
