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
			r, g, b, _ := img.At(x, y).RGBA()
			data = append(data, kmeans.Point{int(r), int(g), int(b)})
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
