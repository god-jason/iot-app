<script>
	import { connectMqtt, subscribe } from './utils/broker.js'

	export default {
		onLaunch: function() {
			this.checkLoginStatus()
		},
		methods: {
			checkLoginStatus() {
				const token = uni.getStorageSync('token')
				if (!token) {
					// 未登录，跳转到登录页
					uni.redirectTo({
						url: '/pages/login/login'
					})
				} else {	
					connectMqtt()					
					//测试
					// subscribe("device/#", function(topic, payload){
					// 	console.log("mqtt device", topic, payload)
					// })
				}
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
	
</style>