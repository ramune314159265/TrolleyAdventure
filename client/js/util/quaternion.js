export const quaternionToEuler = ({ w, x, y, z }) => {
	const sinrCosp = 2 * (w * x + y * z)
	const cosrCosp = 1 - 2 * (x * x + y * y)
	const roll = Math.atan2(sinrCosp, cosrCosp)

	const sinp = 2 * (w * y - z * x)
	const pitch = Math.abs(sinp) >= 1 ? Math.sign(sinp) * (Math.PI / 2) : Math.asin(sinp)

	const sinyCosp = 2 * (w * z + x * y)
	const cosyCosp = 1 - 2 * (y * y + z * z)
	const yaw = Math.atan2(sinyCosp, cosyCosp)

	return { roll, pitch, yaw }
}
