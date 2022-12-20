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
	"path/filepath"

	"github.com/erock2112/kmeans/go/kmeans"
	"github.com/erock2112/kmeans/go/palette"
)

const maxKMeansIterations = 1000

func main() {
	// Setup.
	dir := flag.String("dir", "", "Directory containing images. Expect 'src.jpg' to be present.")
	numColors := flag.Int("colors", 0, "Number of colors to use in the palette.")
	flag.Parse()
	palettizedPath := filepath.Join(*dir, "palettized.jpg")
	if *dir == "" {
		panic("--dir is required.")
	}
	if *numColors == 0 {
		panic("--colors is required.")
	}

	// Read the image.
	srcPath := filepath.Join(*dir, "src.jpg") // TODO: No hard-code.
	srcImage, err := readImage(srcPath)
	if err != nil {
		panic(err)
	}
	bounds := srcImage.Bounds()

	// Create the color srcPalette.
	srcPalette := colorPaletteFromImage(srcImage, *numColors)

	// Write the palette itself to a file.
	if err := writePaletteToFile(srcPalette, filepath.Join(*dir, "palette.jpg")); err != nil {
		panic(err)
	}

	// Apply the palette to the image.
	dstImage := image.NewPaletted(bounds.Bounds(), srcPalette)
	draw.Draw(dstImage, dstImage.Rect, srcImage, bounds.Min, draw.Over)
	if err := writeJPEG(palettizedPath, dstImage); err != nil {
		panic(err)
	}

	// Apply a palette mapping.
	newPalette := palette.Monochrome(color.RGBA{R: 34, G: 69, B: 158, A: 255}, *numColors)
	//newPalette := palette.Subdivide(3)
	if err := writePaletteToFile(newPalette, filepath.Join(*dir, "new_palette.jpg")); err != nil {
		panic(err)
	}

	// Map the old palette onto the new.
	mapping, err := mapNearestGreedy(srcPalette, newPalette)
	if err != nil {
		panic(err)
	}
	fmt.Println("Mapping:")
	for k, v := range mapping {
		fmt.Printf("  %v -> %v\n", k, v)
	}
	dstImage = applyPaletteMap(dstImage, mapping)

	// Write out the new image.
	if err := writeJPEG(filepath.Join(*dir, "with_new_palette.jpg"), dstImage); err != nil {
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
			data = append(data, palette.ColorToPoint(img.At(x, y)))
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

func writePaletteToFile(palette color.Palette, path string) error {
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
	return writeJPEG(path, paletteImage)
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
				dist := palette.ColorToPoint(origColor).SqDist(palette.ColorToPoint(newColor))
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
