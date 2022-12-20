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
	srcPalette := palette.FromImage(srcImage, *numColors, maxKMeansIterations)

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
	mapping, err := palette.MapNearestBruteForce(srcPalette, newPalette)
	if err != nil {
		panic(err)
	}
	fmt.Println("Mapping:")
	for k, v := range mapping {
		fmt.Printf("  %v -> %v\n", k, v)
	}
	dstImage, err = mapping.Apply(dstImage)
	if err != nil {
		panic(err)
	}

	// Write out the new image.
	if err := writeJPEG(filepath.Join(*dir, "bruteforce_mapping.jpg"), dstImage); err != nil {
		panic(err)
	}
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
