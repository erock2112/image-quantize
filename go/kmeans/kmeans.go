package kmeans

import (
	"math/rand"
)

const (
	Dimensions    = 3
	maxIterations = 1000
)

// KMeans implements a naive k-means algorithm.
func KMeans(k int, data []Point) ([]Point, int) {
	centroids := chooseInitialCentroids(data, k)
	for iterations := 0; iterations < maxIterations; iterations++ {
		oldCentroids := centroids
		nearestCentroids := findClosestCentroids(data, centroids)
		centroids = computeNewCentroids(data, nearestCentroids, centroids)
		if centroids.Equal(oldCentroids) {
			return centroids, iterations
		}
	}
	return centroids, maxIterations
}

// computeNewCentroids using the data assigned to each centroid.
func computeNewCentroids(data PointSlice, nearestCentroids []int, centroids PointSlice) PointSlice {
	sums := make([]Point, len(centroids))
	counts := make([]int, len(centroids))
	for idx, point := range data {
		nearestIdx := nearestCentroids[idx]
		sums[nearestIdx].Add(point)
		counts[nearestIdx]++
	}
	newCentroids := make([]Point, 0, len(centroids))
	for idx, count := range counts {
		if count == 0 {
			newCentroids = append(newCentroids, centroids[idx])
		} else {
			sum := sums[idx]
			sum.Divide(count)
			newCentroids = append(newCentroids, sum)
		}
	}
	return newCentroids
}

// findClosestCentroids returns a slice of ints representing the indexes of the
// closest centroids to each of the given data.
func findClosestCentroids(data []Point, centroids []Point) []int {
	rv := make([]int, 0, len(data))
	for _, point := range data {
		rv = append(rv, findClosestCentroid(point, centroids))
	}
	return rv
}

// findClosestCentroid returns the index of the centroid nearest to the given
// Point.
func findClosestCentroid(point Point, centroids []Point) int {
	minDist := -1
	closestIdx := 0
	for idx, centroid := range centroids {
		dist := point.SqDist(centroid)
		if minDist < 0 || dist < minDist {
			minDist = dist
			closestIdx = idx
		}
	}
	return closestIdx
}

// chooseInitialCentroids returns an initial set of centroids.
func chooseInitialCentroids(data PointSlice, k int) PointSlice {
	// Just choose points at random from the data.
	rv := make([]Point, 0, k)
	for i := 0; i < k; i++ {
		rv = append(rv, data[rand.Intn(len(data))])
	}
	return rv
}

// Point represents a single data point.
type Point [Dimensions]int

// Equal returns true if the two Points are equal.
func (p Point) Equal(other Point) bool {
	for idx := range p {
		if p[idx] != other[idx] {
			return false
		}
	}
	return true
}

// Add adds the other Point to this one.
func (p *Point) Add(other Point) {
	for idx := range p {
		p[idx] += other[idx]
	}
}

// Divide divides each element of the Point by the given scalar.
func (p *Point) Divide(scalar int) {
	for idx := range p {
		p[idx] /= scalar
	}
}

// SqDist returns the squared Euclidean distance between the two points.
func (p Point) SqDist(other Point) int {
	rv := 0
	for idx := range p {
		sub := other[idx] - p[idx]
		rv += sub * sub
	}
	return rv
}

// Less returns true if the Point is "less" than the other. We only care about
// having a deterministic sort order, so this isn't a complicated multi-
// dimensional sorting algorithm; we just compare each dimension in turn.
func (p Point) Less(other Point) bool {
	for idx := range p {
		if p[idx] < other[idx] {
			return true
		} else if p[idx] > other[idx] {
			return false
		}
	}
	return false
}

// PointSlice represents a slice of Points.
type PointSlice []Point

// Equal returns true if the two PointSlices are equal.
func (s PointSlice) Equal(other PointSlice) bool {
	if len(s) != len(other) {
		return false
	}
	for idx, point := range s {
		if !point.Equal(other[idx]) {
			return false
		}
	}
	return true
}

// Len implements sort.Interface.
func (s PointSlice) Len() int {
	return len(s)
}

// Less implements sort.Interface.
func (s PointSlice) Less(i, j int) bool {
	return s[i].Less(s[j])
}

// Swap implements sort.Interface.
func (s PointSlice) Swap(i, j int) {
	s[i], s[j] = s[j], s[i]
}
