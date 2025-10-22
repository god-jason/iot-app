<template>
  <view class="change-password-container">
    <!-- 顶部标题 -->
    <view class="page-header">
      <image class="page-icon" src="/static/icon_password/lock.png" mode="aspectFit"></image>
      <text class="page-title">修改密码</text>
      <text class="page-desc">为了账户安全，请定期修改密码</text>
    </view>

    <!-- 密码修改表单 -->
    <view class="password-form">
      <!-- 原密码 -->
      <view class="form-item">
        <view class="item-label">
          <image class="label-icon" src="/static/icon_password/old-password.png" mode="aspectFit"></image>
          <text class="label-text">原密码</text>
          <text class="label-required">*</text>
        </view>
        <view class="input-wrapper">
          <input 
            v-model="form.oldPassword" 
            class="form-input" 
            :password="!showOldPassword"
            placeholder="请输入原密码"
            placeholder-class="placeholder"
            @input="validateOldPassword"
          />
          <view class="password-toggle" @click="togglePassword('old')">
            <image class="toggle-icon" :src="showOldPassword ? '/static/icon_password/eye-close.png' : '/static/icon_password/eye-open.png'" mode="aspectFit"></image>
          </view>
        </view>
        <text class="error-msg" v-if="errors.oldPassword">{{ errors.oldPassword }}</text>
      </view>

      <!-- 新密码 -->
      <view class="form-item">
        <view class="item-label">
          <image class="label-icon" src="/static/icon_password/new-password.png" mode="aspectFit"></image>
          <text class="label-text">新密码</text>
          <text class="label-required">*</text>
        </view>
        <view class="input-wrapper">
          <input 
            v-model="form.newPassword" 
            class="form-input" 
            :password="!showNewPassword"
            placeholder="请输入新密码（6-20位字符）"
            placeholder-class="placeholder"
            @input="validateNewPassword"
          />
          <view class="password-toggle" @click="togglePassword('new')">
            <image class="toggle-icon" :src="showNewPassword ? '/static/icon_password/eye-close.png' : '/static/icon_password/eye-open.png'" mode="aspectFit"></image>
          </view>
        </view>
        <text class="error-msg" v-if="errors.newPassword">{{ errors.newPassword }}</text>
        
        <!-- 密码强度指示器 -->
        <view class="password-strength" v-if="form.newPassword">
          <view class="strength-bar" :class="passwordStrength.level"></view>
          <view class="strength-info">
            <image class="strength-icon" :src="passwordStrength.icon" mode="aspectFit"></image>
            <text class="strength-text">{{ passwordStrength.text }}</text>
          </view>
        </view>
      </view>

      <!-- 确认新密码 -->
      <view class="form-item">
        <view class="item-label">
          <image class="label-icon" src="/static/icon_password/confirm-password.png" mode="aspectFit"></image>
          <text class="label-text">确认新密码</text>
          <text class="label-required">*</text>
        </view>
        <view class="input-wrapper">
          <input 
            v-model="form.confirmPassword" 
            class="form-input" 
            :password="!showConfirmPassword"
            placeholder="请再次输入新密码"
            placeholder-class="placeholder"
            @input="validateConfirmPassword"
          />
          <view class="password-toggle" @click="togglePassword('confirm')">
            <image class="toggle-icon" :src="showConfirmPassword ? '/static/icon_password/eye-close.png' : '/static/icon_password/eye-open.png'" mode="aspectFit"></image>
          </view>
        </view>
        <text class="error-msg" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</text>
        
        <!-- 密码匹配指示 -->
        <view class="match-indicator" v-if="form.confirmPassword">
          <image class="match-icon" :src="isPasswordMatch ? '/static/icon_password/success.png' : '/static/icon_password/error.png'" mode="aspectFit"></image>
          <text class="match-text" :class="{ match: isPasswordMatch, mismatch: !isPasswordMatch }">
            {{ isPasswordMatch ? '密码匹配' : '密码不匹配' }}
          </text>
        </view>
      </view>

      <!-- 密码要求提示 -->
      <view class="password-requirements">
        <view class="requirements-title">
          <image class="requirements-icon" src="/static/icon_password/requirements.png" mode="aspectFit"></image>
          <text>密码要求：</text>
        </view>
        <view class="requirement-item" :class="{ met: hasMinLength }">
          <image class="requirement-icon" :src="hasMinLength ? '/static/icon_password/check.png' : '/static/icon_password/uncheck.png'" mode="aspectFit"></image>
          <text class="requirement-text">至少6个字符</text>
        </view>
        <view class="requirement-item" :class="{ met: hasUpperCase }">
          <image class="requirement-icon" :src="hasUpperCase ? '/static/icon_password/check.png' : '/static/icon_password/uncheck.png'" mode="aspectFit"></image>
          <text class="requirement-text">包含大写字母</text>
        </view>
        <view class="requirement-item" :class="{ met: hasLowerCase }">
          <image class="requirement-icon" :src="hasLowerCase ? '/static/icon_password/check.png' : '/static/icon_password/uncheck.png'" mode="aspectFit"></image>
          <text class="requirement-text">包含小写字母</text>
        </view>
        <view class="requirement-item" :class="{ met: hasNumber }">
          <image class="requirement-icon" :src="hasNumber ? '/static/icon_password/check.png' : '/static/icon_password/uncheck.png'" mode="aspectFit"></image>
          <text class="requirement-text">包含数字</text>
        </view>
        <view class="requirement-item" :class="{ met: hasSpecialChar }">
          <image class="requirement-icon" :src="hasSpecialChar ? '/static/icon_password/check.png' : '/static/icon_password/uncheck.png'" mode="aspectFit"></image>
          <text class="requirement-text">包含特殊字符</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button 
        class="submit-btn" 
        :class="{ disabled: !canSubmit }" 
        :disabled="!canSubmit"
        @click="handleSubmit"
      >
        <image class="btn-icon" src="/static/icon_password/save.png" mode="aspectFit"></image>
        <text class="btn-text">{{ loading ? '修改中...' : '确认修改' }}</text>
      </button>
      
      <button class="cancel-btn" @click="handleCancel">
        <image class="btn-icon" src="/static/icon_password/cancel.png" mode="aspectFit"></image>
        <text class="btn-text">取消</text>
      </button>
    </view>

    <!-- 安全提示 -->
    <view class="security-tips">
      <view class="tips-title">
        <image class="tips-icon" src="/static/icon_password/security.png" mode="aspectFit"></image>
        <text>安全提示</text>
      </view>
      <view class="tip-item">
        <image class="tip-icon" src="/static/icon_password/warning.png" mode="aspectFit"></image>
        <text>请不要使用过于简单的密码</text>
      </view>
      <view class="tip-item">
        <image class="tip-icon" src="/static/icon_password/warning.png" mode="aspectFit"></image>
        <text>建议定期更换密码</text>
      </view>
      <view class="tip-item">
        <image class="tip-icon" src="/static/icon_password/warning.png" mode="aspectFit"></image>
        <text>不要与其他网站使用相同密码</text>
      </view>
      <view class="tip-item">
        <image class="tip-icon" src="/static/icon_password/warning.png" mode="aspectFit"></image>
        <text>如忘记密码，请联系管理员重置</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 表单数据
      form: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      // 错误信息
      errors: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      // 显示密码状态
      showOldPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      // 加载状态
      loading: false
    }
  },
  computed: {
    // 密码强度计算
    passwordStrength() {
      if (!this.form.newPassword) {
        return { level: 'empty', text: '', icon: '' }
      }
      
      let score = 0
      const password = this.form.newPassword
      
      // 长度评分
      if (password.length >= 6) score += 1
      if (password.length >= 8) score += 1
      if (password.length >= 12) score += 1
      
      // 字符类型评分
      if (/[a-z]/.test(password)) score += 1
      if (/[A-Z]/.test(password)) score += 1
      if (/[0-9]/.test(password)) score += 1
      if (/[^a-zA-Z0-9]/.test(password)) score += 1
      
      if (score <= 3) return { level: 'weak', text: '弱', icon: '/static/icon_password/weak.png' }
      if (score <= 5) return { level: 'medium', text: '中', icon: '/static/icon_password/medium.png' }
      return { level: 'strong', text: '强', icon: '/static/icon_password/strong.png' }
    },
    
    // 密码匹配状态
    isPasswordMatch() {
      return this.form.newPassword && this.form.confirmPassword && 
             this.form.newPassword === this.form.confirmPassword
    },
    
    // 密码要求检查
    hasMinLength() {
      return this.form.newPassword.length >= 6
    },
    hasUpperCase() {
      return /[A-Z]/.test(this.form.newPassword)
    },
    hasLowerCase() {
      return /[a-z]/.test(this.form.newPassword)
    },
    hasNumber() {
      return /[0-9]/.test(this.form.newPassword)
    },
    hasSpecialChar() {
      return /[^a-zA-Z0-9]/.test(this.form.newPassword)
    },
    
    // 是否可以提交
    canSubmit() {
      return (
        this.form.oldPassword &&
        this.form.newPassword &&
        this.form.confirmPassword &&
        !this.errors.oldPassword &&
        !this.errors.newPassword &&
        !this.errors.confirmPassword &&
        this.isPasswordMatch &&
        this.hasMinLength
      )
    }
  },
  methods: {
    // 切换密码显示
    togglePassword(type) {
      if (type === 'old') {
        this.showOldPassword = !this.showOldPassword
      } else if (type === 'new') {
        this.showNewPassword = !this.showNewPassword
      } else if (type === 'confirm') {
        this.showConfirmPassword = !this.showConfirmPassword
      }
    },
    
    // 验证原密码
    validateOldPassword() {
      if (!this.form.oldPassword) {
        this.errors.oldPassword = '请输入原密码'
      } else if (this.form.oldPassword.length < 6) {
        this.errors.oldPassword = '密码长度不足'
      } else {
        this.errors.oldPassword = ''
      }
    },
    
    // 验证新密码
    validateNewPassword() {
      if (!this.form.newPassword) {
        this.errors.newPassword = '请输入新密码'
      } else if (this.form.newPassword.length < 6) {
        this.errors.newPassword = '密码至少6位字符'
      } else if (this.form.newPassword === this.form.oldPassword) {
        this.errors.newPassword = '新密码不能与原密码相同'
      } else {
        this.errors.newPassword = ''
      }
    },
    
    // 验证确认密码
    validateConfirmPassword() {
      if (!this.form.confirmPassword) {
        this.errors.confirmPassword = '请确认新密码'
      } else if (this.form.newPassword !== this.form.confirmPassword) {
        this.errors.confirmPassword = '两次输入的密码不一致'
      } else {
        this.errors.confirmPassword = ''
      }
    },
    
    // 处理提交
    async handleSubmit() {
      if (!this.canSubmit || this.loading) return
      
      this.loading = true
      
      try {
        // 模拟API调用
        await this.changePasswordAPI()
        
        uni.showToast({
          title: '密码修改成功',
          icon: 'success',
          duration: 2000
        })
        
        // 清空表单
        this.form = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
        
        // 返回上一页
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
        
      } catch (error) {
        uni.showToast({
          title: error.message || '密码修改失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 模拟修改密码API
    changePasswordAPI() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // 模拟原密码验证
          if (this.form.oldPassword !== '123456') {
            reject(new Error('原密码错误'))
          } else {
            resolve({ success: true })
          }
        }, 1500)
      })
    },
    
    // 处理取消
    handleCancel() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.change-password-container {
  padding: 40rpx 30rpx;
  min-height: 100vh;
  background: #f5f5f5;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 60rpx;
}

.page-icon {
  width: 60rpx;
  height: 60rpx;
  margin: 0 auto 20rpx;
  display: block;
}

.page-title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.page-desc {
  display: block;
  font-size: 26rpx;
  color: #666;
}

/* 表单样式 */
.password-form {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.form-item {
  margin-bottom: 50rpx;
}

.item-label {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  gap: 12rpx;
}

.label-icon {
  width: 28rpx;
  height: 28rpx;
}

.label-text {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
}

.label-required {
  color: #ff4757;
  font-size: 24rpx;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  flex: 1;
  height: 100rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 0 100rpx 0 30rpx;
  font-size: 30rpx;
  border: 2rpx solid #e8e8e8;
  transition: all 0.3s;
}

.form-input:focus {
  border-color: #1890ff;
  background: #f0f8ff;
}

.placeholder {
  color: #999;
  font-size: 28rpx;
}

.password-toggle {
  position: absolute;
  right: 30rpx;
  padding: 10rpx;
}

.toggle-icon {
  width: 32rpx;
  height: 32rpx;
}

.error-msg {
  display: block;
  font-size: 24rpx;
  color: #ff4757;
  margin-top: 12rpx;
}

/* 密码强度指示器 */
.password-strength {
  margin-top: 20rpx;
}

.strength-bar {
  height: 8rpx;
  border-radius: 4rpx;
  margin-bottom: 12rpx;
  transition: all 0.3s;
}

.strength-bar.empty {
  background: #f0f0f0;
  width: 0%;
}

.strength-bar.weak {
  background: #ff4757;
  width: 33%;
}

.strength-bar.medium {
  background: #ffa502;
  width: 66%;
}

.strength-bar.strong {
  background: #2ed573;
  width: 100%;
}

.strength-info {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.strength-icon {
  width: 20rpx;
  height: 20rpx;
}

.strength-text {
  font-size: 24rpx;
  color: #666;
}

/* 密码匹配指示 */
.match-indicator {
  display: flex;
  align-items: center;
  margin-top: 16rpx;
  gap: 8rpx;
}

.match-icon {
  width: 24rpx;
  height: 24rpx;
}

.match-text {
  font-size: 24rpx;
}

.match-text.match {
  color: #2ed573;
}

.match-text.mismatch {
  color: #ff4757;
}

/* 密码要求 */
.password-requirements {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-top: 40rpx;
}

.requirements-title {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 20rpx;
  gap: 10rpx;
}

.requirements-icon {
  width: 24rpx;
  height: 24rpx;
}

.requirement-item {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  gap: 12rpx;
}

.requirement-item:last-child {
  margin-bottom: 0;
}

.requirement-item.met {
  color: #2ed573;
}

.requirement-icon {
  width: 24rpx;
  height: 24rpx;
}

.requirement-text {
  font-size: 24rpx;
  color: #666;
}

.requirement-item.met .requirement-text {
  color: #2ed573;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-bottom: 50rpx;
}

.submit-btn, .cancel-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50rpx;
  height: 100rpx;
  font-size: 32rpx;
  font-weight: bold;
  transition: all 0.3s;
  gap: 12rpx;
}

.submit-btn {
  background: #1890ff;
  color: white;
}

.submit-btn.disabled {
  background: #ccc;
  color: #999;
}

.cancel-btn {
  background: white;
  color: #666;
  border: 2rpx solid #e8e8e8;
  height: 90rpx;
  font-size: 30rpx;
}

.btn-icon {
  width: 32rpx;
  height: 32rpx;
}

/* 安全提示 */
.security-tips {
  background: #e3f2fd;
  border-radius: 16rpx;
  padding: 40rpx 30rpx;
  border-left: 8rpx solid #1890ff;
}

.tips-title {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 20rpx;
  gap: 10rpx;
}

.tips-icon {
  width: 24rpx;
  height: 24rpx;
}

.tip-item {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 12rpx;
  line-height: 1.5;
  gap: 10rpx;
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-icon {
  width: 20rpx;
  height: 20rpx;
}
</style>