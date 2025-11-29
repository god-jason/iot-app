
// #ifdef MP-WEIXIN
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only' // import before mqtt.
import '../node_modules/esbuild-plugin-polyfill-node/polyfills/navigator'
import '../node_modules/esbuild-plugin-polyfill-node/polyfills/process'

import mqtt from "mqtt"
//const mqtt = require("../node_modules/mqtt");
//import mqtt from "mqtt"
//const mqtt = require("./mqtt.min")
console.log("mqtt", mqtt)
//#endif

// #ifndef MP-WEIXIN
import mqtt from "mqtt"
// #endif

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