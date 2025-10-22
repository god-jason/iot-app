<template>
  <view class="settings-container">
    <!-- 第一行：摄像头区域 -->
    <view class="camera-row">
      <text class="section-label">实时监控画面</text>
      <view class="camera-area">
        <!-- 摄像头画面显示 -->
        <view class="camera-placeholder" v-if="!cameraConnected">
          <image class="camera-icon" src="/static/icon_settings/camera.png" mode="aspectFit"></image>
          <text class="camera-text">摄像头未连接</text>
          <button class="connect-btn" @click="connectCamera">连接摄像头</button>
        </view>
        <image v-else class="camera-image" :src="cameraImage" mode="aspectFit"></image>
        
        <!-- 摄像头状态 -->
        <view class="camera-status">
          <view class="status-item">
            <image class="status-icon" src="/static/icon_settings/status.png" mode="aspectFit"></image>
            <text>状态: {{ cameraStatus }}</text>
          </view>
          <view class="status-item">
            <image class="status-icon" src="/static/icon_settings/resolution.png" mode="aspectFit"></image>
            <text>分辨率: 1920x1080</text>
          </view>
          <view class="status-item">
            <image class="status-icon" src="/static/icon_settings/frame-rate.png" mode="aspectFit"></image>
            <text>帧率: 30fps</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 第二行：参数显示和操作按钮 -->
    <view class="params-row">
      <text class="section-label">环境参数</text>
      <view class="params-content">
        <!-- 参数显示 -->
        <view class="params-display">
          <view class="param-item">
            <image class="param-icon" src="/static/icon_settings/temperature.png" mode="aspectFit"></image>
            <view class="param-info">
              <text class="param-label">温度</text>
              <text class="param-value">{{ temperature }}°C</text>
            </view>
          </view>
          <view class="param-item">
            <image class="param-icon" src="/static/icon_settings/humidity.png" mode="aspectFit"></image>
            <view class="param-info">
              <text class="param-label">湿度</text>
              <text class="param-value">{{ humidity }}%</text>
            </view>
          </view>
          <view class="param-item">
            <image class="param-icon" src="/static/icon_settings/water-level.png" mode="aspectFit"></image>
            <view class="param-info">
              <text class="param-label">水位</text>
              <text class="param-value">{{ waterLevel }}m</text>
            </view>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="action-buttons">
          <button class="action-btn status-btn" @click="showRealTimeStatus">
            <image class="btn-icon" src="/static/icon_settings/chart.png" mode="aspectFit"></image>
            <text class="btn-text">实时状态</text>
          </button>
          <button class="action-btn adjust-btn" @click="showParamAdjust">
            <image class="btn-icon" src="/static/icon_settings/settings.png" mode="aspectFit"></image>
            <text class="btn-text">参数调整</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 第三行：开关机控制 -->
    <view class="control-row">
      <text class="section-label">设备控制</text>
      <view class="control-buttons">
        <button class="control-btn power-on" :class="{ disabled: isPowerOn }" @click="powerOn">
          <image class="btn-icon" src="/static/icon_settings/power-on.png" mode="aspectFit"></image>
          <text class="btn-text">开机</text>
        </button>
        <button class="control-btn power-off" :class="{ disabled: !isPowerOn }" @click="powerOff">
          <image class="btn-icon" src="/static/icon_settings/power-off.png" mode="aspectFit"></image>
          <text class="btn-text">关机</text>
        </button>
      </view>
      <view class="power-status">
        <image class="status-icon" :src="isPowerOn ? '/static/icon_settings/running.png' : '/static/icon_settings/stopped.png'" mode="aspectFit"></image>
        <text class="status-text">当前状态: </text>
        <text class="status-value" :class="isPowerOn ? 'on' : 'off'">
          {{ isPowerOn ? '运行中' : '已关机' }}
        </text>
      </view>
    </view>

    <!-- 第四行：报警信息 -->
    <view class="alarm-row">
      <text class="section-label">报警信息</text>
      <scroll-view class="alarm-list" scroll-y>
        <view class="alarm-item" v-for="(alarm, index) in alarmList" :key="index"
              :class="alarm.level">
          <view class="alarm-header">
            <view class="alarm-time">
              <image class="time-icon" src="/static/icon_settings/time.png" mode="aspectFit"></image>
              <text>{{ alarm.time }}</text>
            </view>
            <view class="alarm-level">
              <image class="level-icon" :src="alarm.levelIcon" mode="aspectFit"></image>
              <text>{{ alarm.levelText }}</text>
            </view>
          </view>
          <text class="alarm-content">{{ alarm.content }}</text>
        </view>
        
        <!-- 空状态 -->
        <view v-if="alarmList.length === 0" class="empty-alarms">
          <image class="empty-icon" src="/static/icon_settings/no-alarm.png" mode="aspectFit"></image>
          <text class="empty-text">暂无报警信息</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 摄像头相关
      cameraConnected: false,
      cameraImage: '/static/icon_settings/camera-placeholder.png',
      cameraStatus: '离线',
      
      // 环境参数
      temperature: 15,
      humidity: 65,
      waterLevel: 2.3,
      
      // 设备状态
      isPowerOn: false,
      
      // 报警信息
      alarmList: [
        {
          time: '2024-01-20 14:25:36',
          level: 'warning',
          levelIcon: '/static/icon_settings/warning.png',
          levelText: '警告',
          content: '温度等于15度，低于安全阈值'
        },
        {
          time: '2024-01-20 13:45:22',
          level: 'critical',
          levelIcon: '/static/icon_settings/critical.png',
          levelText: '严重',
          content: '水位过低：1.2m，请及时处理'
        },
        {
          time: '2024-01-20 12:30:15',
          level: 'info',
          levelIcon: '/static/icon_settings/info.png',
          levelText: '提示',
          content: '设备自动重启完成'
        }
      ]
    }
  },
  onLoad() {
    // 模拟数据更新
    this.startDataUpdate()
  },
  onUnload() {
    // 清除定时器
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
    }
  },
  methods: {
    // 连接摄像头
    connectCamera() {
      uni.showLoading({
        title: '连接中...'
      })
      
      setTimeout(() => {
        this.cameraConnected = true
        this.cameraStatus = '在线'
        uni.hideLoading()
        uni.showToast({
          title: '摄像头连接成功',
          icon: 'success'
        })
      }, 2000)
    },
    
    // 显示实时状态
    showRealTimeStatus() {
      uni.showModal({
        title: '实时状态',
        content: `温度: ${this.temperature}°C\n湿度: ${this.humidity}%\n水位: ${this.waterLevel}m`,
        showCancel: false
      })
    },
    
    // 显示参数调整
    showParamAdjust() {
      uni.navigateTo({
        url: '/pages/settings/param-adjust'
      })
    },
    
    // 开机
    powerOn() {
      if (this.isPowerOn) return
      
      uni.showModal({
        title: '确认开机',
        content: '确定要开启设备吗？',
        success: (res) => {
          if (res.confirm) {
            this.isPowerOn = true
            this.addAlarm('设备已启动', 'info')
            uni.showToast({
              title: '设备启动成功',
              icon: 'success'
            })
          }
        }
      })
    },
    
    // 关机
    powerOff() {
      if (!this.isPowerOn) return
      
      uni.showModal({
        title: '确认关机',
        content: '确定要关闭设备吗？',
        success: (res) => {
          if (res.confirm) {
            this.isPowerOn = false
            this.addAlarm('设备已关闭', 'info')
            uni.showToast({
              title: '设备已关闭',
              icon: 'success'
            })
          }
        }
      })
    },
    
    // 添加报警信息
    addAlarm(content, level = 'warning') {
      const now = new Date()
      const time = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
      
      const levelConfig = {
        info: { text: '提示', icon: '/static/icon_settings/info.png' },
        warning: { text: '警告', icon: '/static/icon_settings/warning.png' },
        critical: { text: '严重', icon: '/static/icon_settings/critical.png' }
      }[level]
      
      this.alarmList.unshift({
        time,
        level,
        levelIcon: levelConfig.icon,
        levelText: levelConfig.text,
        content
      })
      
      // 限制报警列表长度
      if (this.alarmList.length > 10) {
        this.alarmList = this.alarmList.slice(0, 10)
      }
    },
    
    // 启动数据更新
    startDataUpdate() {
      this.updateTimer = setInterval(() => {
        // 模拟数据变化
        this.temperature = 15 + Math.random() * 2 - 1
        this.humidity = 65 + Math.random() * 10 - 5
        this.waterLevel = 2.3 + Math.random() * 0.4 - 0.2
        
        // 模拟报警
        if (this.temperature <= 15 && Math.random() > 0.8) {
          this.addAlarm(`温度等于${this.temperature.toFixed(1)}度，请注意监控`, 'warning')
        }
      }, 5000)
    }
  }
}
</script>

<style scoped>
.settings-container {
  padding: 30rpx;
  min-height: 100vh;
  background: #f5f5f5;
}

.section-label {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

/* 第一行：摄像头区域 */
.camera-row {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.camera-area {
  border: 2rpx dashed #ddd;
  border-radius: 12rpx;
  height: 400rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.camera-placeholder {
  text-align: center;
}

.camera-icon {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 20rpx;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.camera-text {
  display: block;
  font-size: 28rpx;
  color: #999;
  margin-bottom: 30rpx;
}

.connect-btn {
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 40rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
}

.camera-image {
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
}

.camera-status {
  position: absolute;
  bottom: 20rpx;
  left: 20rpx;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 16rpx 24rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.status-item {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
  gap: 8rpx;
}

.status-item:last-child {
  margin-bottom: 0;
}

.status-icon {
  width: 20rpx;
  height: 20rpx;
}

/* 第二行：参数显示和操作按钮 */
.params-row {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.params-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.params-display {
  flex: 1;
}

.param-item {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.param-item:last-child {
  margin-bottom: 0;
}

.param-icon {
  width: 48rpx;
  height: 48rpx;
  margin-right: 20rpx;
}

.param-info {
  flex: 1;
}

.param-label {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.param-value {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f8f9fa;
  border: none;
  border-radius: 16rpx;
  padding: 30rpx 20rpx;
  min-width: 140rpx;
}

.btn-icon {
  width: 40rpx;
  height: 40rpx;
  margin-bottom: 10rpx;
}

.btn-text {
  font-size: 24rpx;
  color: #333;
}

/* 第三行：开关机控制 */
.control-row {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.control-buttons {
  display: flex;
  gap: 30rpx;
  margin-bottom: 20rpx;
}

.control-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: none;
  border-radius: 16rpx;
  padding: 40rpx 20rpx;
}

.control-btn.power-on {
  background: #52c41a;
  color: white;
}

.control-btn.power-on.disabled {
  background: #f5f5f5;
  color: #999;
}

.control-btn.power-off {
  background: #f5222d;
  color: white;
}

.control-btn.power-off.disabled {
  background: #f5f5f5;
  color: #999;
}

.power-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.status-icon {
  width: 24rpx;
  height: 24rpx;
}

.status-text {
  font-size: 28rpx;
  color: #666;
}

.status-value {
  font-size: 28rpx;
  font-weight: bold;
}

.status-value.on {
  color: #52c41a;
}

.status-value.off {
  color: #f5222d;
}

/* 第四行：报警信息 */
.alarm-row {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.alarm-list {
  height: 300rpx;
  border: 1rpx solid #eee;
  border-radius: 12rpx;
  padding: 20rpx;
}

.alarm-item {
  padding: 24rpx;
  border-left: 8rpx solid #1890ff;
  border-radius: 8rpx;
  background: #f8f9fa;
  margin-bottom: 20rpx;
}

.alarm-item.warning {
  border-left-color: #faad14;
  background: #fffbe6;
}

.alarm-item.critical {
  border-left-color: #f5222d;
  background: #fff2f0;
}

.alarm-item.info {
  border-left-color: #52c41a;
  background: #f6ffed;
}

.alarm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.alarm-time {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: #666;
}

.time-icon {
  width: 20rpx;
  height: 20rpx;
}

.alarm-level {
  display: flex;
  align-items: center;
  gap: 6rpx;
  font-size: 22rpx;
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  background: rgba(0, 0, 0, 0.1);
}

.level-icon {
  width: 16rpx;
  height: 16rpx;
}

.alarm-content {
  font-size: 26rpx;
  color: #333;
  line-height: 1.5;
}

.empty-alarms {
  text-align: center;
  padding: 80rpx 0;
}

.empty-icon {
  width: 60rpx;
  height: 60rpx;
  margin-bottom: 20rpx;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>