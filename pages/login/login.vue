<template>
	<view class="login-container">
		<!-- 顶部背景 -->

		<view class="logo">
			<image src="/static/logo.jpg" mode="aspectFill"></image>
		</view>
		
		
		<uni-card>
			
			<view class="login-header">
				登 录
			</view>

			<uni-forms ref="form">
				<uni-forms-item>
					<uni-easyinput v-model="form.username" placeholder="请输入用户名/手机号" prefix-icon="person" />
				</uni-forms-item>
				<uni-forms-item>
					<uni-easyinput type="password" v-model="form.password" placeholder="请输入密码" prefix-icon="locked" />
				</uni-forms-item>
				<uni-forms-item>
					<label>
						<checkbox :value="rememberPassword" /><text>记住密码</text>
					</label>
					<text class="forgot-password" @click="navigateToForgot"> 忘记密码?</text>
				</uni-forms-item>
			</uni-forms>

			<button type="primary" class="login-btn" :class="{ 'disabled': !canLogin }" :disabled="!canLogin" @click="handleLogin">
				{{ loading ? '登录中...' : '登录' }}
			</button>

			<view class="other-login">
				<text class="divider">或使用以下方式登录</text>
				<view @click="wechatLogin">
					<uni-icons type="weixin"></uni-icons>
					<text>微信小程序授权登录</text>
				</view>
			</view>


		</uni-card>

	</view>
</template>

<script>
	export default {
		data() {
			return {
				form: {
					username: '',
					password: ''
				},
				rememberPassword: false,
				loading: false
			}
		},
		computed: {
			// 验证是否可以登录
			canLogin() {
				return this.form.username.length > 0 &&
					this.form.password.length >= 6 &&
					!this.loading
			}
		},
		onLoad() {
			// 检查是否有保存的登录信息
			this.checkSavedLogin()
		},
		methods: {
			// 处理登录
			async handleLogin() {
				if (!this.canLogin) return

				this.loading = true

				try {
					// 模拟登录请求
					await this.mockLogin()

					// 保存登录状态
					if (this.rememberPassword) {
						uni.setStorageSync('userInfo', this.form)
					}

					uni.setStorageSync('token', 'mock-token-' + Date.now())
					uni.setStorageSync('isLoggedIn', true)

					// 显示成功提示
					uni.showToast({
						title: '登录成功',
						icon: 'success'
					})

					// 跳转到首页
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/device/device',
							success: () => {
								console.log('跳转成功')
							},
							fail: (err) => {
								console.log('跳转失败:', err)
							}
						})
					}, 1000)

				} catch (error) {
					uni.showToast({
						title: error.message || '登录失败',
						icon: 'none'
					})
				} finally {
					this.loading = false
				}
			},

			// 模拟登录API调用
			mockLogin() {
				return new Promise((resolve, reject) => {
					setTimeout(() => {
						// 模拟登录验证
						if (this.form.username === 'admin' && this.form.password === '123456') {
							resolve({
								success: true
							})
						} else {
							reject(new Error('用户名或密码错误'))
						}
					}, 1000)
				})
			},

			// 检查保存的登录信息
			checkSavedLogin() {
				const savedUserInfo = uni.getStorageSync('userInfo')
				if (savedUserInfo) {
					this.form = {
						...savedUserInfo
					}
					this.rememberPassword = true
				}
			},

			// 微信登录
			wechatLogin() {
				uni.showToast({
					title: '微信登录功能开发中',
					icon: 'none'
				})
			},

			// 跳转到忘记密码页面
			navigateToForgot() {
				uni.showToast({
					title: '忘记密码功能开发中',
					icon: 'none'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.login-container {
		min-height: 100vh;
		//background-color: #1296db;
		background-color: #f8f8f8;
		//background: linear-gradient(135deg, #1296db 0%, #764ba2 100%);
	}
	
	.logo{
		padding-top: 120rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		image{
			width: 375rpx;
			height: 375rpx;
			border-radius: 50%;
		}
	}

	.login-header {
		text-align: center;
		font-size: 48rpx;
		font-weight: bold;
		//color: white;
		//margin-bottom: 20rpx;
		padding: 40rpx 0;
	}
	

	.forgot-password {
		font-size: 28rpx;
		color: #667eea;
	}

	.login-btn {
		//background: linear-gradient(135deg, #1296db 0%, #764ba2 100%);		
		//background-color: #1296db;
		//color: white;
		//border: none;
		border-radius: 50rpx;
		height: 90rpx;
		line-height: 90rpx;
		font-size: 32rpx;
		margin-bottom: 40rpx;
	}

	.login-btn.disabled {
		background: #ccc;
		color: #999;
	}

	.other-login {
		text-align: center;
	}

	.divider {
		display: block;
		color: #999;
		font-size: 26rpx;
		margin-bottom: 40rpx;
		position: relative;
	}

	.divider::before,
	.divider::after {
		content: '';
		position: absolute;
		top: 50%;
		width: 100rpx;
		height: 1rpx;
		background: #eee;
	}

	.divider::before {
		left: 60rpx;
	}

	.divider::after {
		right: 60rpx;
	}

	.login-methods {
		display: flex;
		justify-content: center;
		gap: 60rpx;
	}

	.method-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: none;
		border: none;
		padding: 20rpx;
	}

	/* 修改微信图标样式 */
	.method-icon {
		width: 50rpx;
		height: 50rpx;
		margin-bottom: 10rpx;
	}

	.method-btn text:last-child {
		font-size: 24rpx;
		color: #666;
	}
</style>