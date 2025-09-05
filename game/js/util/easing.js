export const easeOutQuint = (x) => {
	return 1 - Math.pow(1 - x, 5)
}

export const easeInQuint = (x) => {
	return x * x * x * x * x
}

export const easeInQuart = (x) => {
	return x * x * x * 4
}
