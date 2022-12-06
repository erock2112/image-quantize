package main

import (
	"bytes"
	"flag"
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"image/jpeg"
	"os"

	"github.com/erock2112/kmeans/go/kmeans"
)

const maxKMeansIterations = 1000

func main() {
	// Setup.
	srcPath := flag.String("src", "", "Source image path.")
	dstPath := flag.String("dst", "", "Destination image path.")
	palettePath := flag.String("palette", "", "If provided, write the color palette to this path.")
	numColors := flag.Int("colors", 0, "Number of colors to use in the palette.")
	flag.Parse()
	if *srcPath == "" {
		panic("--src is required.")
	}
	if *dstPath == "" {
		panic("--dst is required.")
	}
	if *numColors == 0 {
		panic("--colors is required.")
	}

	// Read the image.
	srcImage, err := readImage(*srcPath)
	if err != nil {
		panic(err)
	}
	bounds := srcImage.Bounds()

	// Create the color palette.
	palette := colorPaletteFromImage(srcImage, *numColors)

	// Write the palette itself to a file if requested.
	if *palettePath != "" {
		const palettePixels = 50
		paletteImage := image.NewRGBA(image.Rect(0, 0, palettePixels, palettePixels*len(palette)))
		for idx, color := range palette {
			yOffset := idx * palettePixels
			for x := 0; x < palettePixels; x++ {
				for y := yOffset; y < yOffset+palettePixels; y++ {
					paletteImage.Set(x, y, color)
				}
			}
		}
		if err := writeJPEG(*palettePath, paletteImage); err != nil {
			panic(err)
		}
	}

	// Apply the palette to the image.
	dstImage := image.NewPaletted(bounds.Bounds(), palette)
	draw.Draw(dstImage, dstImage.Rect, srcImage, bounds.Min, draw.Over)

	// Apply a palette mapping.
	newPalette := []color.Color{}
	const colorDiv = 2
	for r := 0; r <= colorDiv; r++ {
		rVal := r * 255 / colorDiv
		for g := 0; g <= colorDiv; g++ {
			gVal := g * 255 / colorDiv
			for b := 0; b <= colorDiv; b++ {
				bVal := b * 255 / colorDiv
				newPalette = append(newPalette, color.RGBA{
					R: uint8(rVal),
					G: uint8(gVal),
					B: uint8(bVal),
					A: 255,
				})
			}
		}
	}
	mapping, err := mapNearestGreedy(palette, newPalette)
	if err != nil {
		panic(err)
	}
	dstImage = applyPaletteMap(dstImage, mapping)

	// Write out the new image.
	if err := writeJPEG(*dstPath, dstImage); err != nil {
		panic(err)
	}
}

// colorPaletteFromImage creates a color.Palette from the given image.Image with
// the given number of colors.
func colorPaletteFromImage(img image.Image, numColors int) color.Palette {
	// Read all of the pixels into an array.
	bounds := img.Bounds()
	data := make([]kmeans.Point, 0, bounds.Dx()*bounds.Dy())
	for x := bounds.Min.X; x < bounds.Max.X; x++ {
		for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
			data = append(data, ColorToPoint(img.At(x, y)))
		}
	}

	// Find the k-means of the pixels and create a color palette.
	centroids, err := kmeans.KMeans(data, numColors, maxKMeansIterations)
	if err != nil {
		panic("colorPaletteFromImage produced inconsistent data")
	}
	var palette color.Palette = make([]color.Color, 0, len(centroids))
	for _, centroid := range centroids {
		palette = append(palette, color.RGBA{
			R: uint8(centroid[0] >> 8),
			G: uint8(centroid[1] >> 8),
			B: uint8(centroid[2] >> 8),
			A: 255,
		})
	}
	return palette
}

// writeJPEG is a convenience function for writing a JPEG image.
func writeJPEG(path string, img image.Image) (err error) {
	f, err := os.Create(path)
	if err != nil {
		panic(err)
	}
	defer func() {
		if err2 := f.Close(); err2 != nil && err == nil {
			err = err2
		}
	}()
	if err := jpeg.Encode(f, img, &jpeg.Options{
		Quality: 100,
	}); err != nil {
		return err
	}
	fmt.Println("Wrote ", path)
	return nil
}

// readImageFile is a convenience function for reading an Image.
func readImage(path string) (image.Image, error) {
	contents, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	img, _, err := image.Decode(bytes.NewReader(contents))
	if err != nil {
		return nil, err
	}
	return img, nil
}

func ColorToPoint(c color.Color) kmeans.Point {
	r, g, b, _ := c.RGBA()
	return kmeans.Point{int(r), int(g), int(b)}
}

func mapNearestGreedy(oldPalette, newPalette color.Palette) (map[color.Color]color.Color, error) {
	if len(newPalette) < len(oldPalette) {
		return nil, fmt.Errorf("new palette has fewer colors than the old, %d vs %d", len(newPalette), len(oldPalette))
	}

	origMap := make(map[color.Color]bool, len(oldPalette))
	for _, color := range oldPalette {
		origMap[color] = true
	}
	newMap := make(map[color.Color]bool, len(newPalette))
	for _, color := range newPalette {
		newMap[color] = true
	}

	rv := make(map[color.Color]color.Color, len(oldPalette))
	for {
		minDist := -1
		var chosenOrig color.Color
		var chosenNew color.Color
		for origColor := range origMap {
			for newColor := range newMap {
				dist := ColorToPoint(origColor).SqDist(ColorToPoint(newColor))
				if minDist < 0 || dist < minDist {
					minDist = dist
					chosenOrig = origColor
					chosenNew = newColor
				}
			}
		}
		rv[chosenOrig] = chosenNew
		delete(origMap, chosenOrig)
		delete(newMap, chosenNew)
		if len(origMap) == 0 {
			break
		}
	}
	return rv, nil
}

func applyPaletteMap(img *image.Paletted, mapping map[color.Color]color.Color) *image.Paletted {
	bounds := img.Bounds()
	palette := make([]color.Color, 0, len(mapping))
	for _, c := range mapping {
		palette = append(palette, c)
	}
	rv := image.NewPaletted(bounds.Bounds(), palette)
	for x := bounds.Min.X; x < bounds.Max.X; x++ {
		for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
			rv.Set(x, y, mapping[img.At(x, y)])
		}
	}
	return rv
}
