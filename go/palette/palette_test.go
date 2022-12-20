package palette

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestNChooseK(t *testing.T) {
	check := func(n, k int, expect [][]int) {
		actual := NChooseK(n, k)
		require.Equal(t, expect, actual, "NChooseK(%d, %d)", n, k)
	}

	check(0, 0, nil)
	check(0, 1, nil)
	check(1, 0, nil)
	check(1, 1, [][]int{
		{0},
	})
	check(1, 2, nil)
	check(2, 1, [][]int{
		{0},
		{1},
	})
	check(2, 2, [][]int{
		{0, 1},
	})
	check(2, 3, nil)
	check(3, 1, [][]int{
		{0},
		{1},
		{2},
	})
	check(3, 2, [][]int{
		{0, 1},
		{0, 2},
		{1, 2},
	})
	check(3, 3, [][]int{
		{0, 1, 2},
	})
	check(4, 2, [][]int{
		{0, 1},
		{0, 2},
		{0, 3},
		{1, 2},
		{1, 3},
		{2, 3},
	})
}

func TestPermute(t *testing.T) {
	check := func(n int, expect [][]int) {
		actual := Permute(n)
		require.Equal(t, expect, actual, "Permute(%d)", n)
	}
	check(0, nil)
	check(1, [][]int{{0}})
	check(2, [][]int{
		{0, 1},
		{1, 0},
	})
	check(3, [][]int{
		{0, 1, 2},
		{1, 0, 2},
		{2, 0, 1},
		{0, 2, 1},
		{1, 2, 0},
		{2, 1, 0},
	})
	check(4, [][]int{
		{0, 1, 2, 3},
		{1, 0, 2, 3},
		{2, 0, 1, 3},
		{0, 2, 1, 3},
		{1, 2, 0, 3},
		{2, 1, 0, 3},
		{3, 1, 2, 0},
		{1, 3, 2, 0},
		{2, 3, 1, 0},
		{3, 2, 1, 0},
		{1, 2, 3, 0},
		{2, 1, 3, 0},
		{3, 0, 2, 1},
		{0, 3, 2, 1},
		{2, 3, 0, 1},
		{3, 2, 0, 1},
		{0, 2, 3, 1},
		{2, 0, 3, 1},
		{3, 0, 1, 2},
		{0, 3, 1, 2},
		{1, 3, 0, 2},
		{3, 1, 0, 2},
		{0, 1, 3, 2},
		{1, 0, 3, 2},
	})
}
