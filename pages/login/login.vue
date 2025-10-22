<template>
  <view class="login-container">
    <!-- 顶部背景 -->
    <view class="login-header">
      <text class="welcome-text">欢迎回来</text>
      <text class="sub-title">请登录您的账户</text>
    </view>

    <!-- 登录表单 -->
    <view class="login-form">
      <!-- 用户名输入 -->
      <view class="input-group">
        <view class="input-item">
          <image class="item-icon" src="/static/icon_login/phone.png" mode="aspectFit"></image>
          <input 
            v-model="form.username" 
            class="input" 
            placeholder="请输入用户名/手机号"
            placeholder-class="placeholder"
          />
        </view>
        
        <!-- 密码输入 -->
        <view class="input-item">
          <image class="item-icon" src="/static/icon_login/lock.png" mode="aspectFit"></image>
          <input 
            v-model="form.password" 
            class="input" 
            password 
            placeholder="请输入密码"
            placeholder-class="placeholder"
          />
        </view>
      </view>

      <!-- 记住密码和忘记密码 -->
      <view class="form-options">
        <label class="remember-me">
          <checkbox :checked="rememberPassword" @click="rememberPassword = !rememberPassword" />
          <text>记住密码</text>
        </label>
        <text class="forgot-password" @click="navigateToForgot">忘记密码?</text>
      </view>

      <!-- 登录按钮 -->
      <button 
        class="login-btn" 
        :class="{ 'disabled': !canLogin }"
        :disabled="!canLogin"
        @click="handleLogin"
      >
        {{ loading ? '登录中...' : '登录' }}
      </button>

      <!-- 其他登录方式 -->
      <view class="other-login">
        <text class="divider">或使用以下方式登录</text>
        <view class="login-methods">
          <button class="method-btn wechat" @click="wechatLogin">
            <image class="method-icon" src="/static/icon_login/wechat.png" mode="aspectFit"></image>
            <text>微信</text>
          </button>
        </view>
      </view>
    </view>
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
            url: '/pages/stats/stats',
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
            resolve({ success: true })
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
        this.form = { ...savedUserInfo }
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

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-header {
  padding: 120rpx 60rpx 80rpx;
  text-align: center;
}

.welcome-text {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 20rpx;
}

.sub-title {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.login-form {
  background: white;
  margin: 0 30rpx;
  border-radius: 20rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
}

.input-group {
  margin-bottom: 50rpx;
}

.input-item {
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #eee;
  padding: 30rpx 0;
  margin-bottom: 20rpx;
}

.input-item:last-child {
  margin-bottom: 0;
}

/* 修改图标样式 */
.item-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
}

.input {
  flex: 1;
  font-size: 32rpx;
  height: 60rpx;
  line-height: 60rpx;
}

.placeholder {
  color: #ccc;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 60rpx;
}

.remember-me {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #666;
}

.forgot-password {
  font-size: 28rpx;
  color: #667eea;
}

.login-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
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