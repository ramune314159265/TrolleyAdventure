export const parseObjects = string => {
	try {
		const json = JSON.parse(string)
		return json
	} catch {
		const num = Number(string)
		if (!isNaN(num) && string.trim() !== '') {
			return num
		}
		return string
	}
}
