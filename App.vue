<script>
	import { connectMqtt, subscribe } from './utils/mqtt'

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
					
					//TODO 不应该放这里
					subscribe("device/#")
				}
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
	
</style>