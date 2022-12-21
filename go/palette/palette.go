package palette

import (
	"fmt"
	"image"
	"image/color"
	"math"
	"regexp"
	"sort"
	"strconv"

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
	// Convert back to 8 bits per channel to keep from having to deal with both
	// 8 and 16-bit values.
	srcR = srcR >> 8
	srcG = srcG >> 8
	srcB = srcB >> 8

	baseLuminosity := float32(Luminosity(from))
	ratioLeftR := float32(srcR) / baseLuminosity
	ratioLeftG := float32(srcG) / baseLuminosity
	ratioLeftB := float32(srcB) / baseLuminosity
	rightLuminositySpan := float32(math.MaxUint8 - baseLuminosity)
	ratioRightR := float32(math.MaxUint8-srcR) / rightLuminositySpan
	ratioRightG := float32(math.MaxUint8-srcG) / rightLuminositySpan
	ratioRightB := float32(math.MaxUint8-srcB) / rightLuminositySpan
	scale := float32(math.MaxUint8) / float32(steps-1)

	for i := 0; i < steps; i++ {
		luminosity := float32(i) * scale
		var r, g, b uint32
		if luminosity < baseLuminosity {
			r = uint32(luminosity * ratioLeftR)
			g = uint32(luminosity * ratioLeftG)
			b = uint32(luminosity * ratioLeftB)
		} else {
			luminosityAdj := luminosity - baseLuminosity
			r = srcR + uint32(luminosityAdj*ratioRightR)
			g = srcG + uint32(luminosityAdj*ratioRightG)
			b = srcB + uint32(luminosityAdj*ratioRightB)
		}
		c := color.RGBA{
			R: uint8(r),
			G: uint8(g),
			B: uint8(b),
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

// SortedByLuminosity returns a copy of the Palette sorted by luminosity.
func SortedByLuminosity(p color.Palette) []color.Color {
	// Something about the fact that color.Color is a non-pointer interface
	// causes weird problems when we sort a []color.Color instead of the
	// concrete type.
	rgba := make([]color.RGBA, 0, len(p))
	for _, c := range p {
		r, g, b, a := c.RGBA()
		rgba = append(rgba, color.RGBA{
			R: uint8(r >> 8),
			G: uint8(g >> 8),
			B: uint8(b >> 8),
			A: uint8(a >> 8),
		})
	}
	sort.Sort(ColorPaletteByLuminosity(rgba))
	rv := make([]color.Color, 0, len(rgba))
	for _, c := range rgba {
		rv = append(rv, color.Color(c))
	}
	return rv
}

type ColorPaletteByLuminosity []color.RGBA

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
// must be the same size.
func MapByLuminosity(src, dst color.Palette) (Map, error) {
	return MapDirect(SortedByLuminosity(src), SortedByLuminosity(dst))
}

// MapDirect maps the source palette directly to the destination palette without
// any processing. The source and destination palettes must be the same size.
func MapDirect(src, dst color.Palette) (Map, error) {
	if len(src) != len(dst) {
		return nil, fmt.Errorf("src and dst palettes must be the same size, %d vs %d", len(dst), len(src))
	}
	rv := make(map[color.Color]color.Color, len(src))
	for idx, srcColor := range src {
		rv[srcColor] = dst[idx]
	}
	return rv, nil
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

var hexParsed = regexp.MustCompile("#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})")

// HexToColor converts a hexadecimal string of the form "#ffffff" to a
// color.Color.
func HexToColor(hex string) (color.Color, error) {
	m := hexParsed.FindStringSubmatch(hex)
	if len(m) != 4 {
		return color.Black, fmt.Errorf("invalid hex color %q", hex)
	}
	r, err := strconv.ParseUint(m[1], 16, 8)
	if err != nil {
		return color.Black, fmt.Errorf("failed parsing %q as hex: %s", m[1], err)
	}
	g, err := strconv.ParseUint(m[2], 16, 8)
	if err != nil {
		return color.Black, fmt.Errorf("failed parsing %q as hex: %s", m[2], err)
	}
	b, err := strconv.ParseUint(m[3], 16, 8)
	if err != nil {
		return color.Black, fmt.Errorf("failed parsing %q as hex: %s", m[3], err)
	}
	return color.RGBA{R: uint8(r), G: uint8(g), B: uint8(b), A: 255}, nil
}

// InvertColor returns an inverted version of the given Color.
func InvertColor(c color.Color) color.Color {
	r, g, b, a := c.RGBA()
	inv := color.RGBA{
		R: uint8(math.MaxUint8 - (r >> 8)),
		G: uint8(math.MaxUint8 - (g >> 8)),
		B: uint8(math.MaxUint8 - (b >> 8)),
		A: uint8(a >> 8),
	}
	return inv
}

func InvertPalette(p color.Palette) color.Palette {
	rv := make([]color.Color, 0, len(p))
	for _, c := range p {
		rv = append(rv, InvertColor(c))
	}
	return rv
}
