<template>
  <view class="param-adjust-container">
    <!-- 顶部标题 -->
    <view class="page-header">
      <text class="page-title">参数调整</text>
    </view>

    <!-- 参数调整表单 -->
    <view class="adjust-form">
      <!-- 温度校准 -->
      <view class="form-item">
        <view class="item-label">
          <text class="label-text">温度校准</text>
          <text class="label-unit">(°C)</text>
        </view>
        <input 
          v-model="formData.temperatureCalibration" 
          class="form-input" 
          type="number"
          placeholder="请输入温度校准值"
          placeholder-class="placeholder"
        />
        <text class="item-desc">当前参考值: {{ currentParams.temperature }}°C</text>
      </view>

      <!-- 1级转速 -->
      <view class="form-item">
        <view class="item-label">
          <text class="label-text">1级转速</text>
          <text class="label-unit">(RPM)</text>
        </view>
        <input 
          v-model="formData.speedLevel1" 
          class="form-input" 
          type="number"
          placeholder="请输入1级转速"
          placeholder-class="placeholder"
        />
        <text class="item-desc">当前值: {{ currentParams.speedLevel1 }} RPM</text>
      </view>

      <!-- 2级转速 -->
      <view class="form-item">
        <view class="item-label">
          <text class="label-text">2级转速</text>
          <text class="label-unit">(RPM)</text>
        </view>
        <input 
          v-model="formData.speedLevel2" 
          class="form-input" 
          type="number"
          placeholder="请输入2级转速"
          placeholder-class="placeholder"
        />
        <text class="item-desc">当前值: {{ currentParams.speedLevel2 }} RPM</text>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="action-bar">
      <button class="save-btn" :class="{ disabled: !isFormValid }" @click="handleSave">
        <text class="btn-text">保存设置</text>
      </button>
    </view>

    <!-- 当前参数预览 -->
    <view class="preview-section">
      <text class="preview-title">参数预览</text>
      <view class="preview-list">
        <view class="preview-item">
          <text class="preview-label">温度校准:</text>
          <text class="preview-value">{{ formData.temperatureCalibration || currentParams.temperatureCalibration }}°C</text>
        </view>
        <view class="preview-item">
          <text class="preview-label">1级转速:</text>
          <text class="preview-value">{{ formData.speedLevel1 || currentParams.speedLevel1 }} RPM</text>
        </view>
        <view class="preview-item">
          <text class="preview-label">2级转速:</text>
          <text class="preview-value">{{ formData.speedLevel2 || currentParams.speedLevel2 }} RPM</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 表单数据
      formData: {
        temperatureCalibration: '',
        speedLevel1: '',
        speedLevel2: ''
      },
      // 当前参数值
      currentParams: {
        temperature: 15.0,
        temperatureCalibration: 0.0,
        speedLevel1: 1500,
        speedLevel2: 2800
      }
    }
  },
  computed: {
    // 表单验证
    isFormValid() {
      return (
        this.formData.temperatureCalibration !== '' &&
        this.formData.speedLevel1 !== '' &&
        this.formData.speedLevel2 !== '' &&
        !isNaN(this.formData.temperatureCalibration) &&
        !isNaN(this.formData.speedLevel1) &&
        !isNaN(this.formData.speedLevel2)
      )
    }
  },
  onLoad() {
    this.loadCurrentParams()
  },
  methods: {
    // 加载当前参数
    loadCurrentParams() {
      // 从本地存储或API加载当前参数
      const savedParams = uni.getStorageSync('deviceParams')
      if (savedParams) {
        this.currentParams = { ...this.currentParams, ...savedParams }
      }
      
      // 设置表单默认值为当前参数
      this.formData = {
        temperatureCalibration: this.currentParams.temperatureCalibration.toString(),
        speedLevel1: this.currentParams.speedLevel1.toString(),
        speedLevel2: this.currentParams.speedLevel2.toString()
      }
    },
    
    // 处理保存
    async handleSave() {
      if (!this.isFormValid) {
        uni.showToast({
          title: '请填写所有参数',
          icon: 'none'
        })
        return
      }
      
      // 验证参数范围
      if (!this.validateParams()) {
        return
      }
      
      uni.showLoading({
        title: '保存中...'
      })
      
      try {
        // 模拟保存到API
        await this.saveToAPI()
        
        // 更新当前参数
        this.updateCurrentParams()
        
        // 保存到本地存储
        uni.setStorageSync('deviceParams', this.currentParams)
        
        uni.hideLoading()
        
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
        
        // 返回上一页
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
        
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    },
    
    // 验证参数范围
    validateParams() {
      const tempCalib = parseFloat(this.formData.temperatureCalibration)
      const speed1 = parseInt(this.formData.speedLevel1)
      const speed2 = parseInt(this.formData.speedLevel2)
      
      if (tempCalib < -10 || tempCalib > 10) {
        uni.showToast({
          title: '温度校准范围: -10°C 到 10°C',
          icon: 'none'
        })
        return false
      }
      
      if (speed1 < 1000 || speed1 > 2000) {
        uni.showToast({
          title: '1级转速范围: 1000-2000 RPM',
          icon: 'none'
        })
        return false
      }
      
      if (speed2 < 2000 || speed2 > 3500) {
        uni.showToast({
          title: '2级转速范围: 2000-3500 RPM',
          icon: 'none'
        })
        return false
      }
      
      if (speed1 >= speed2) {
        uni.showToast({
          title: '2级转速必须大于1级转速',
          icon: 'none'
        })
        return false
      }
      
      return true
    },
    
    // 模拟保存到API
    saveToAPI() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true })
        }, 1000)
      })
    },
    
    // 更新当前参数
    updateCurrentParams() {
      this.currentParams = {
        ...this.currentParams,
        temperatureCalibration: parseFloat(this.formData.temperatureCalibration),
        speedLevel1: parseInt(this.formData.speedLevel1),
        speedLevel2: parseInt(this.formData.speedLevel2)
      }
    }
  }
}
</script>

<style scoped>
.param-adjust-container {
  padding: 30rpx;
  min-height: 100vh;
  background: #f5f5f5;
}

.page-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

/* 表单样式 */
.adjust-form {
  background: white;
  border-radius: 16rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.form-item {
  margin-bottom: 50rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.item-label {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.label-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-right: 10rpx;
}

.label-unit {
  font-size: 24rpx;
  color: #666;
}

.form-input {
  height: 100rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 0 30rpx;
  font-size: 32rpx;
  border: 2rpx solid #e8e8e8;
  margin-bottom: 15rpx;
}

.form-input:focus {
  border-color: #1890ff;
}

.placeholder {
  color: #999;
  font-size: 28rpx;
}

.item-desc {
  font-size: 24rpx;
  color: #999;
}

/* 保存按钮 */
.action-bar {
  padding: 0 30rpx;
}

.save-btn {
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 50rpx;
  height: 100rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.save-btn.disabled {
  background: #ccc;
  color: #999;
}

/* 参数预览 */
.preview-section {
  background: white;
  border-radius: 16rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.preview-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
  display: block;
}

.preview-list {
  border: 1rpx solid #eee;
  border-radius: 12rpx;
  overflow: hidden;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
  background: #fafafa;
}

.preview-item:last-child {
  border-bottom: none;
}

.preview-label {
  font-size: 28rpx;
  color: #666;
}

.preview-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #1890ff;
}
</style>