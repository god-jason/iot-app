<script>
	export default {
		onLaunch: function() {
			this.checkLoginStatus()
		},
		  methods: {
		    checkLoginStatus() {
		      const isLoggedIn = uni.getStorageSync('isLoggedIn')
		      const token = uni.getStorageSync('token')
		      if (!isLoggedIn || !token) {
		        // 未登录，跳转到登录页
		        uni.redirectTo({
		          url: '/pages/login/login'
		        })
		      }
		    }
		  }
		}
</script>

<style>
	/*每个页面公共css */
</style>
