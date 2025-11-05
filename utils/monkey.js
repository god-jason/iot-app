
let token = undefined

// 替换基础request
export const rawRequest = uni.request
uni.request = function(options) {
	if (!token) return rawRequest(options)
}

export clearToken = 
