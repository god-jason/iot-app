import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only' 
//import 'esbuild-plugin-polyfill-node/polyfills/navigator'

//const mqtt = require ("mqtt")
import mqtt from 'mqtt'

import {
	mqtt_server
} from "@/app.config";


var client

export function connectMqtt() {
	// #ifdef MP-WEIXIN
	broker = mqtt_server.replace("wss", "wxs")
	// #endif	
	client = mqtt.connect(mqtt_server, {
		timerVariant: 'native' 
	})
	client.on("error", console.error)
	client.on("message", function(topic, payload) {
		console.log("mqtt message", topic, payload.toString())
	})
}

export function subscribe(filter, cb) {
	client.subscribe(filter)
}

export function unsubscribe(filter, cb) {
	client.unsubscribe(filter)
}