package palette

import (
	"fmt"
	"image"
	"image/color"
	"math"
	"sort"

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

// FromImage creates a color.Palette from the given image.Image with the given
// number of colors.
func FromImage(img image.Image, numColors, maxKMeansIterations int) color.Palette {
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

// Map describes a mapping from one color.Palette to another. This helps to
// avoid multiple source colors "collapsing" onto a single destination color,
// which is relevant when using palettes of limited size.
type Map map[color.Color]color.Color

// Apply returns a new image.Paletted with the palette mapping applied to the
// given source image.Paletted. If any colors in the source image are not in the
// Map, an error is returned.
func (m Map) Apply(src *image.Paletted) (*image.Paletted, error) {
	bounds := src.Bounds()
	palette := make([]color.Color, 0, len(m))
	for _, c := range m {
		palette = append(palette, c)
	}
	fmt.Printf("Creating new image from palette mapping:\n")
	for k, v := range m {
		fmt.Printf("  %v -> %v\n", k, v)
	}
	rv := image.NewPaletted(bounds.Bounds(), palette)
	for x := bounds.Min.X; x < bounds.Max.X; x++ {
		for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
			srcColor := src.At(x, y)
			dstColor, ok := m[srcColor]
			if !ok {
				return nil, fmt.Errorf("source palette does not include color %+v", srcColor)
			}
			rv.Set(x, y, dstColor)
		}
	}
	return rv, nil
}

// ComputeError returns the total error (squared Euclidean distance between
// source and destination colors) of the map.
func (m Map) ComputeError() int64 {
	total := int64(0)
	for src, dst := range m {
		total += ColorToPoint(src).SqDist(ColorToPoint(dst))
	}
	return total
}

// MapNearestGreedy creates a Map by iteratively choosing the nearest color
// pairs in src and dst.
func MapNearestGreedy(src, dst color.Palette) (Map, error) {
	if len(dst) < len(src) {
		return nil, fmt.Errorf("dst palette has fewer colors than the src, %d vs %d", len(dst), len(src))
	}

	origMap := make(map[color.Color]bool, len(src))
	for _, color := range src {
		origMap[color] = true
	}
	newMap := make(map[color.Color]bool, len(dst))
	for _, color := range dst {
		newMap[color] = true
	}

	rv := make(map[color.Color]color.Color, len(src))
	for {
		minDist := int64(-1)
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

// MapNearestBruteForce creates a Map by choosing all combinations of src and
// dst color pairs and returning the one with the least total error. Will be
// extremely slow for large palettes, particularly if src and dst have different
// sizes.
func MapNearestBruteForce(src, dst color.Palette) (Map, error) {
	if len(dst) < len(src) {
		return nil, fmt.Errorf("dst palette has fewer colors than the src, %d vs %d", len(dst), len(src))
	}

	bestError := int64(-1)
	var bestMap Map

	// Choose subsets of the destination palette.
	for _, subsetIndexes := range NChooseK(len(dst), len(src)) {
		// Map every permutation of source colors to destination colors.
		for _, permuteIndexes := range Permute(len(src)) {
			if len(subsetIndexes) != len(permuteIndexes) {
				return nil, fmt.Errorf("internal error; got mismatched number of subset indexes %v and permutation indexes %v", subsetIndexes, permuteIndexes)
			}
			var m Map = make(map[color.Color]color.Color, len(src))
			for i := 0; i < len(permuteIndexes); i++ {
				m[src[permuteIndexes[i]]] = dst[subsetIndexes[i]]
			}
			totalError := m.ComputeError()
			if bestError < 0 || totalError < bestError {
				bestError = totalError
				bestMap = m
			}
		}
	}

	return bestMap, nil
}

// SortByLuminosity sorts the Palette by luminosity.
func SortByLuminosity(p color.Palette) {
	sort.Stable(ColorPaletteByLuminosity(p))
}

type ColorPaletteByLuminosity []color.Color

func (p ColorPaletteByLuminosity) Len() int {
	return len(p)
}

func (p ColorPaletteByLuminosity) Less(i, j int) bool {
	// This is inefficient because we're recomputing the luminosity O(n lg(n))
	// times, but palettes shouldn't be too big anyway.
	return Luminosity(p[i]) < Luminosity(p[j])
}

func (p ColorPaletteByLuminosity) Swap(i, j int) {
	p[i], p[j] = p[j], p[i]
}

// MapByLuminosity maps the source palette to the destination by first finding
// the luminosity of each color and sorting. The source and destination palettes
// should be the same size.
func MapByLuminosity(src, dst color.Palette) (Map, error) {
	if len(src) != len(dst) {
		return nil, fmt.Errorf("src and dst palettes should be the same size, %d vs %d", len(dst), len(src))
	}
	/*fmt.Println("src (before):")
	for _, c := range src {
		fmt.Printf("  Lum(%+v): %d\n", c, Luminosity(c))
	}*/
	SortByLuminosity(src)
	/*fmt.Println("src (after):")
	for _, c := range src {
		fmt.Printf("  Lum(%+v): %d\n", c, Luminosity(c))
	}*/
	SortByLuminosity(dst)
	/*fmt.Println("dst:")
	for _, c := range dst {
		fmt.Printf("  Lum(%+v): %d\n", c, Luminosity(c))
	}*/
	rv := make(map[color.Color]color.Color, len(src))
	for idx, srcColor := range src {
		rv[srcColor] = dst[idx]
	}
	return rv, nil

	/*
		srcMap := make(map[int][]color.Color, len(src))
		srcLuminosities := make([]int, 0, len(src))
		for _, c := range src {
			l := int(Luminosity(c))
			srcMap[l] = append(srcMap[l], c)
			srcLuminosities = append(srcLuminosities, l)
		}
		sort.Ints(srcLuminosities)
		srcSorted := make([]color.Color, 0, len(srcLuminosities))
		for _, l := range srcLuminosities {
			colors, ok := srcMap[l]
			if ok {
				srcSorted = append(srcSorted, colors...)
				delete(srcMap, l)
			}
		}

		dstMap := make(map[int][]color.Color, len(dst))
		dstLuminosities := make([]int, 0, len(dst))
		for _, c := range dst {
			l := int(Luminosity(c))
			dstMap[l] = append(dstMap[l], c)
			dstLuminosities = append(dstLuminosities, l)
		}
		sort.Ints(dstLuminosities)
		dstSorted := make([]color.Color, 0, len(dstLuminosities))
		for _, l := range dstLuminosities {
			colors, ok := dstMap[l]
			if ok {
				dstSorted = append(dstSorted, colors...)
				delete(dstMap, l)
			}
		}

		rv := make(map[color.Color]color.Color, len(srcSorted))
		for idx, srcColor := range srcSorted {
			rv[srcColor] = dstSorted[idx]
		}
		return rv, nil
	*/
}

// NChooseK returns all combinations of choosing k elements from a set of size
// n. The return value can be used as indexes into arrays or slices.
// TODO: This belongs in a math package of some kind.
func NChooseK(n, k int) [][]int {
	if n == 0 || k == 0 || k > n {
		return nil
	}
	var rv [][]int
	scratch := make([]int, k)
	var nChooseKHelper func(remaining, start int)
	nChooseKHelper = func(remaining, start int) {
		if remaining == 0 {
			cp := make([]int, k)
			copy(cp, scratch)
			rv = append(rv, cp)
			return
		}
		for i := start; i <= n-remaining; i++ {
			scratch[k-remaining] = i
			nChooseKHelper(remaining-1, i+1)
		}
	}
	nChooseKHelper(k, 0)
	return rv
}

// Permute computes all possible permutations of n elements. The return value
// can be used as indexes into arrays or slices. This is an implementation of
// Heap's algorithm.
// TODO: This belongs in a math package of some kind.
func Permute(n int) [][]int {
	var rv [][]int
	scratch := make([]int, 0, n)
	for i := 0; i < n; i++ {
		scratch = append(scratch, i)
	}
	var helper func(size int)
	helper = func(size int) {
		if size == 1 {
			cp := make([]int, len(scratch))
			copy(cp, scratch)
			rv = append(rv, cp)
			return
		}
		for i := 0; i < size; i++ {
			helper(size - 1)
			if size%2 == 1 {
				scratch[0], scratch[size-1] = scratch[size-1], scratch[0]
			} else {
				scratch[i], scratch[size-1] = scratch[size-1], scratch[i]
			}
		}
	}
	helper(n)
	return rv
}

// Luminosity returns the perceptual luminosity of the Color.
func Luminosity(c color.Color) uint8 {
	r, g, b, _ := c.RGBA()
	return uint8(uint16(0.3*float32(r)+0.59*float32(g)+0.11*float32(b)) >> 8)
}

// Greyscale converts the Color to greyscale.
func Greyscale(c color.Color) color.Color {
	l := Luminosity(c)
	return color.RGBA{
		R: l,
		G: l,
		B: l,
		A: math.MaxUint8,
	}
}
