import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import store from './store'
import {request} from '@/utils/request.js'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
Vue.prototype.$http = request
Vue.prototype.$store = store
App.mpType = 'app'
const app = new Vue({
	store,
	...App
})
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
import * as Pinia from 'pinia';
export function createApp() {
	const app = createSSRApp(App)
	app.use(Pinia.createPinia())
	return {
		app,
		Pinia
	}
}
// #endif