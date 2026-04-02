import {
	get
} from "./request"

const settings = {}

export async function getSetting(id, name) {
	let key = id + "@" + name
	let setting = settings[key]
	if (setting) {
		if (setting.loading) {
			return await new Promise((resolve, reject) => {
				setting.waits.push({
					resolve,
					reject
				})
			})
		}
		return setting.object;
	} else {
		//
		setting = {
			loading: true,
			waits: []
		}
		settings[key] = setting
	}

	try {
		//setting.loading = true
		let res = await get("product/" + id + "/setting/" + name)
		setting.loading = false
		setting.object = res.data
		//console.log("waits", id, setting.waits.length)
		setting.waits.forEach(w => {
			w.resolve(res.data)
		})
		setting.waits = []
	} catch (e) {
		setting.loading = false
		setting.waits.forEach(w => {
			w.reject(e)
		})
		setting.waits = []
		throw e
	}

	return setting.object
}