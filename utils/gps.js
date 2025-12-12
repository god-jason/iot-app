// WGS84 -> GCJ02（地图组件使用 GCJ02）
export function wgs84ToGcj02(lat, lon) {

	if (outOfChina(lat, lon))
		return {
			latitude: lat,
			longitude: lon
		}
	const a = 6378245.0
	const ee = 0.00669342162296594323

	let dLat = transformLat(lon - 105.0, lat - 35.0)
	let dLon = transformLon(lon - 105.0, lat - 35.0)
	const radLat = lat / 180.0 * Math.PI
	let magic = Math.sin(radLat)
	magic = 1 - ee * magic * magic
	const sqrtMagic = Math.sqrt(magic)
	dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI)
	dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI)
	const mgLat = lat + dLat
	const mgLon = lon + dLon

	return {
		latitude: Number(mgLat.toFixed(6)),
		longitude: Number(mgLon.toFixed(6))
	}
}

function outOfChina(lat, lon) {
	return lon < 72.004 || lon > 137.8347 || lat < 0.8293 || lat > 55.8271
}

function transformLat(x, y) {
	let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x))
	ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0
	ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0
	ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0
	return ret
}

function transformLon(x, y) {
	let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x))
	ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0
	ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0
	ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0
	return ret
}

// 计算两点距离（km）
export function calcDistanceKm(lat1, lon1, lat2, lon2) {
	const toRad = (deg) => deg * Math.PI / 180
	const R = 6371
	const dLat = toRad(lat2 - lat1)
	const dLon = toRad(lon2 - lon1)
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2)
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	return Number((R * c).toFixed(2))
}