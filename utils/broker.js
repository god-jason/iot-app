// #ifdef MP-WEIXIN
//const mqtt = require("./mqtt.js")
//import * as mqtt from './mqtt.min.js' //v3.0.0
//import mqtt from './mqtt'
import * as mqtt from "mqtt/dist/mqtt"

//#endif

// #ifndef MP-WEIXIN
//import * as mqtt from 'mqtt'
import * as mqtt from "mqtt/dist/mqtt"
// #endif



import {
	mqtt_server
} from "@/app.config";


var client

let subs = {} // 订阅历史
let sub_tree = {
	children: {}, // topic->sub_tree
	callbacks: []
}

// 查询订阅树
function find_callback(node, topics, topic, payload) {
	// 叶子节点，执行回调
	if (topics.length == 0) {
		node.callbacks.forEach(cb => cb(topic, payload))
		return
	}

	let sub = node.children["#"]
	sub && find_callback(sub, [], topic, payload)

	let t = topics[0]
	topics.splice(0, 1)

	sub = node.children["+"]
	sub && find_callback(sub, topics, topic, payload)

	sub = node.children[t]
	sub && find_callback(sub, topics, topic, payload)
}



export function connectMqtt() {

	// #ifdef MP-WEIXIN
	console.log("connect mqtt wxs", mqtt_server)
	client = mqtt.connect(mqtt_server.replace("wss", "wxs"), {
		timerVariant: 'native'
	})
	// #endif

	// #ifndef MP-WEIXIN
	console.log("connect mqtt", mqtt_server)
	client = mqtt.connect(mqtt_server)
	// #endif

	client.on("error", console.error)
	client.on("message", function(topic, payload) {
		//console.log("mqtt message", topic, payload.toString())
		let ts = topic.split("/")
		let data
		try{
			data = JSON.parse(payload.toString())
		}catch(e){
			data = payload
		}
		find_callback(sub_tree, ts, topic, data)
	})
	client.on("connect", function() {
		console.log("mqtt connected")
		// 恢复订阅
		Object.keys(subs).forEach(s => {
			if (subs[s] > 0)
				client.subscribe(s)
		})
	})
}



export function subscribe(filter, cb) {
	// 计数，避免重复订阅
	if (subs[filter] && subs[filter] > 0) {
		subs[filter] = subs[filter] + 1
	} else {
		client && client.subscribe(filter)
		subs[filter] = 1
	}

	let fs = filter.split("/")

	// 创建树枝
	let sub = sub_tree

	fs.forEach(f => {
		let s = sub.children[f]
		if (!s) {
			s = {
				children: {},
				callbacks: []
			}
			sub.children[f] = s
		}
		sub = s
	})
	sub.callbacks.push(cb)
}

export function unsubscribe(filter, cb) {
	// 取消订阅
	if (subs[filter]) {
		if (cb) {
			subs[filter] = subs[filter] - 1
			if (subs[filter] <= 0)
				client.unsubscribe(filter)
		} else {
			client.unsubscribe(filter)
		}
	}

	let fs = filter.split("/")

	// 查树枝
	let sub = sub_tree
	fs.forEach(f => {
		let s = sub.children[f]
		if (!s)
			return // 找不到了
		sub = s
	})

	// 删除回调
	if (callbacks.length > 1 && cb) {
		for (var i = 0; i < sub.callbacks.length; i++) {
			if (sub.callbacks[i] == cb) {
				sub.callbacks.splice(i, 1)
				break
			}
		}
	} else {
		sub.callbacks = {}
	}
}