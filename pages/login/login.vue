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
					<uni-easyinput v-model="form.username" placeholder="请输入用户名" prefix-icon="person" />
				</uni-forms-item>
				<uni-forms-item>
					<uni-easyinput type="password" v-model="form.password" placeholder="请输入密码" prefix-icon="locked" />
				</uni-forms-item>
				<uni-forms-item>
					<view class="form-actions">
						<view class="remember-password">
							<checkbox :checked="rememberPassword" @click="toggleRememberPassword" />
							<text @click="toggleRememberPassword">记住密码</text>
						</view>
						<text class="forgot-password" @click="navigateToForgot">忘记密码?</text>
					</view>
				</uni-forms-item>
			</uni-forms>

			<button type="primary" class="login-btn" :class="{ 'disabled': !canLogin }" :disabled="!canLogin" @click="handleLogin">
				{{ loading ? '登录中...' : '登录' }}
			</button>

			<view class="other-login">
				<text class="divider">或使用以下方式登录</text>
				<view class="wechat-login" @click="wechatLogin">
					<uni-icons type="weixin" size="24"></uni-icons>
					<text>微信小程序授权登录</text>
				</view>
			</view>
		</uni-card>
	</view>
</template>

<script>
	import {
		login,
		setToken
	} from '@/utils/request.js';

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
			// 切换记住密码状态
			toggleRememberPassword() {
				this.rememberPassword = !this.rememberPassword;
			},

			// 处理登录
			async handleLogin() {
				if (!this.canLogin) return

				this.loading = true

				try {
					// 调用实际的后端登录接口
					const res = await this.realLogin()

					// 保存登录状态
					if (this.rememberPassword) {
						uni.setStorageSync('userInfo', this.form)
					} else {
						uni.removeStorageSync('userInfo')
					}

					// 保存 token 和登录状态
					uni.setStorageSync('isLoggedIn', true)
					
					// 显示成功提示
					uni.showToast({
						title: '登录成功',
						icon: 'success',
						duration: 2000
					})

					// 跳转到首页
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/device/device'
						})
					}, 1500)

				} catch (error) {
					console.error('登录错误:', error)
					uni.showToast({
						title: error.message || '登录失败',
						icon: 'none',
						duration: 3000
					})
				} finally {
					this.loading = false
				}
			},

			// 实际登录API调用
			// 在 login.vue 的 realLogin 方法中
			async realLogin() {
			  try {
			    console.log('📝 开始登录请求...');
			    const res = await login(this.form.username, this.form.password);
			    
			    console.log('✅ 登录响应详情:', res);
			    
			    // 更灵活的响应处理
			    if (res && (res.code === 200 || res.success || res.data)) {
			      console.log('🎉 登录成功!');
			      
			      // 处理token和用户信息
			      const token = res.data?.token || res.token;
			      const userData = res.data?.user || res.user || res.data;
			      
			      if (token) {
			        setToken(token);
			        console.log('💾 Token已保存:', token);
			      }
			      if (userData) {
			        uni.setStorageSync('userData', userData);
			        console.log('💾 用户信息已保存:', userData);
			      }
			      
			      return res;
			    } else {
			      console.error('❌ 后端返回错误结构:', res);
			      throw new Error(res?.message || res?.msg || '登录失败，请检查响应格式');
			    }
			  } catch (error) {
			    console.error('💥 登录完整错误信息:', {
			      name: error.name,
			      message: error.message,
			      statusCode: error.statusCode,
			      responseData: error.data,
			      stack: error.stack
			    });
			    
			    // 更详细的错误提示
			    let userMessage = '登录失败';
			    if (error.statusCode === 401) {
			      userMessage = '用户名或密码错误';
			    } else if (error.statusCode === 404) {
			      userMessage = '登录接口不存在';
			    } else if (error.statusCode === 500) {
			      userMessage = '服务器内部错误';
			    } else if (error.message.includes('网络请求失败')) {
			      userMessage = '网络连接失败，请检查后端服务';
			    }
			    
			    throw new Error(userMessage);
			  }
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
		background-color: #f8f8f8;
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
		padding: 40rpx 0;
	}
	
	.form-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}
	
	.remember-password {
		display: flex;
		align-items: center;
		font-size: 28rpx;
		color: #666;
		
		checkbox {
			margin-right: 10rpx;
		}
		
		text {
			margin-left: 10rpx;
		}
	}
	
	.forgot-password {
		font-size: 28rpx;
		color: #667eea;
	}

	.login-btn {
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
	
	.wechat-login {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20rpx;
		
		uni-icons {
			margin-bottom: 10rpx;
			color: #09BB07;
		}
		
		text {
			font-size: 24rpx;
			color: #666;
		}
	}
</style>