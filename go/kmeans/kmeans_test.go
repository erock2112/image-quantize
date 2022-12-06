package kmeans

import (
	"sort"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestKMeans(t *testing.T) {
	test := func(name string, data []Point, k int, expect []Point) {
		t.Run(name, func(t *testing.T) {
			actual, err := KMeans(data, k, 100)
			require.NoError(t, err)
			sort.Sort((PointSlice(actual)))
			require.Equal(t, expect, actual)
		})
	}
	test("simple k=1", []Point{
		{0, 0, 0},
		{10, 10, 10},
	}, 1, []Point{
		{5, 5, 5},
	})
	test("simple k=2", []Point{
		{0, 0, 0},
		{10, 10, 10},
	}, 2, []Point{
		{0, 0, 0},
		{10, 10, 10},
	})
	test("slightly more complex", []Point{
		{-1, -1, -1},
		{-1, -1, 1},
		{-1, 1, -1},
		{1, -1, -1},
		{-1, 1, 1},
		{1, 1, -1},
		{1, -1, 1},
		{1, 1, 1},

		{9, 9, 9},
		{9, 9, 11},
		{9, 11, 9},
		{11, 9, 9},
		{9, 11, 11},
		{11, 11, 9},
		{11, 9, 11},
		{11, 11, 11},
	}, 2, []Point{
		{0, 0, 0},
		{10, 10, 10},
	})
}
