export const stringSplitByLength = (str, length) => {
	const result = []
	for (let i = 0; i < str.length; i += length) {
		result.push(str.slice(i, i + length))
	}
	return result
}
