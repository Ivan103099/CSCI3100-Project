package utils

func SliceMaybeEmpty[T any](slice []T) []T {
	if len(slice) == 0 {
		return make([]T, 0)
	}
	return slice
}
