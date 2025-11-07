import {
	get
} from "./request"

const models = {}

export async function getModel(id) {
	let model = models[id]
	if (model) {
		if (model.loading) {
			return await new Promise((resolve, reject) => {
				model.waits.push({
					resolve,
					reject
				})
			})
		}
		return model.object;
	} else {
		//
		model = {
			loading: true,
			waits: []
		}
		models[id] = model
	}

	try {
		//model.loading = true
		let res = await get("iot/product/" + id + "/model")
		model.loading = false
		model.object = res.data
		//console.log("waits", id, model.waits.length)
		model.waits.forEach(w => {
			w.resolve(res.data)
		})
		model.waits = []
	} catch (e) {
		model.loading = false
		model.waits.forEach(w => {
			w.reject(e)
		})
		model.waits = []
		throw e
	}

	return model.object
}