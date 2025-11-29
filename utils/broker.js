import mqtt from '../node_modules/mqtt/dist/mqtt.js'

import {
	mqtt_server
} from "@/app.config";

var client

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
		console.log("mqtt message", topic, payload.toString())
	})
	client.on("connect", function() {
		console.log("mqtt connected")
	})
}

export function subscribe(filter, cb) {
	client.subscribe(filter)
}

export function unsubscribe(filter, cb) {
	client.unsubscribe(filter)
}