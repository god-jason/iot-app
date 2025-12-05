import {
	api_server
} from "@/app.config";

//启动加载Token
let token = uni.getStorageSync("token")

export function clearToken() {
	token = undefined
	uni.removeStorageSync("token")
}

export function setToken(tkn) {
	token = tkn
	uni.setStorageSync("token", tkn)
}

export async function request(options) {
	let header = options.header || {}
	//添加JWT到Header中
	if (!header.Authorization && token)
		header.Authorization = `Bearer ${token}`;

	return new Promise((resolve, reject) => {
		uni.request({
			...options,
			header: header,
			success: (res) => {
				if (res.statusCode === 200) {
					let data = res.data;
					if (data.error) {
						uni.showToast({
							icon: "error",
							title: data.error,
						})
						reject(new Error(data.error))
					} else {
						resolve(res.data);
					}
				} else {
					reject(new Error(res.data || `服务器错误 ${res.statusCode}`));
				}
			},
			fail: (err) => {
				reject(err)
			},
		})
	})
}

export async function get(api, data, options) {
	return request({
		url: api_server + api,
		method: "GET",
		data: data,
		...options
	})
}

export async function post(api, data, options) {
	return request({
		url: api_server + api,
		method: "POST",
		data: data,
		...options
	})
}

