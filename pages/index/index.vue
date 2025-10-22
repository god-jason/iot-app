<template>
  <view class="container">
	  
    <!-- 第一行：设备动态数量 -->
    <view class="stats-row">
      <view class="stat-card" v-for="(stat, index) in deviceStats" :key="index">
        <text class="stat-value">{{ stat.value }}</text>
        <text class="stat-label">{{ stat.label }}</text>
      </view>
    </view>
	
	<uni-section title="设备列表" type="square">
		<uni-search-bar placeholder="快捷搜索" @confirm="search"></uni-search-bar>
	</uni-section>
	
	<uni-card title="设备名称" sub-title="8645245241455" extra="在线" thumbnail="/static/device.png">
		
		
		
	</uni-card>
	

    <!-- 第二行：搜索和数据显示 -->
    <view class="search-row">
      <!-- 搜索栏 -->
      <view class="search-section">
        <text class="section-label">设备监控</text>
        <view class="search-box">
          <input 
            v-model="searchKeyword" 
            class="search-input" 
            placeholder="搜索设备或参数..."
            placeholder-class="placeholder"
            @input="handleSearch"
          />
          <image class="search-icon" src="/static/icon_stats/search.png" mode="aspectFit"></image>
        </view>
      </view>

      <!-- 数据显示区域 -->
      <view class="data-display">
        <scroll-view class="data-content" scroll-y>
          <view class="data-item" v-for="(item, index) in filteredData" :key="index" @click="openDevice(item)">
            <view class="data-header">
              <text class="device-name">{{ item.deviceName }}</text>
              <view class="device-status" :class="item.status">
                <image class="status-icon" :src="item.statusIcon" mode="aspectFit"></image>
                <text class="status-text">{{ item.statusText }}</text>
              </view>
            </view>
            <view class="data-details">
              <view class="data-param">
                <image class="param-icon" src="/static/icon_stats/water.png" mode="aspectFit"></image>
                <text class="param-label">水位:</text>
                <text class="param-value">{{ item.waterLevel }}m</text>
              </view>
              <view class="data-param">
                <image class="param-icon" src="/static/icon_stats/power.png" mode="aspectFit"></image>
                <text class="param-label">功率:</text>
                <text class="param-value">{{ item.power }}kW</text>
              </view>
              <view class="data-param">
                <image class="param-icon" src="/static/icon_stats/switch.png" mode="aspectFit"></image>
                <text class="param-label">开关状态:</text>
                <text class="param-value" :class="item.switchStatus">
                  {{ item.switchStatus === 'on' ? '开启' : '关闭' }}
                </text>
              </view>
              <view class="data-param">
                <image class="param-icon" src="/static/icon_stats/time.png" mode="aspectFit"></image>
                <text class="param-label">更新时间:</text>
                <text class="param-value">{{ item.updateTime }}</text>
              </view>
            </view>
          </view>
          
          <!-- 空状态 -->
          <view v-if="filteredData.length === 0" class="empty-state">
            <image class="empty-icon" src="/static/icon_stats/empty.png" mode="aspectFit"></image>
            <text class="empty-text">暂无数据</text>
          </view>
        </scroll-view>
      </view>
    </view>

    </view>
	
</template>

<script>
export default {
  data() {
    return {
      // 设备统计数据
      deviceStats: [
        { 
          value: '12', 
          label: '在线设备', 
          trend: 'up',
          trendIcon: '/static/icon_stats/trend-up.png'
        },
        { 
          value: '3', 
          label: '离线设备', 
          trend: 'down',
          trendIcon: '/static/icon_stats/trend-down.png'
        },
        { 
          value: '5', 
          label: '告警设备', 
          trend: 'up',
          trendIcon: '/static/icon_stats/trend-up.png'
        }
      ],
      // 搜索关键词
      searchKeyword: '',
      // 当前页面
      currentPage: 'stats',
      // 模拟设备数据
      deviceData: [
        {
          deviceName: '水泵设备-001',
          status: 'online',
          statusIcon: '/static/icon_stats/online.png',
          statusText: '在线',
          waterLevel: 2.5,
          power: 15.2,
          switchStatus: 'on',
          updateTime: '2024-01-20 14:30:25'
        },
        {
          deviceName: '水箱设备-002',
          status: 'online',
          statusIcon: '/static/icon_stats/online.png',
          statusText: '在线',
          waterLevel: 3.8,
          power: 8.5,
          switchStatus: 'off',
          updateTime: '2024-01-20 14:28:10'
        },
        {
          deviceName: '发电设备-003',
          status: 'warning',
          statusIcon: '/static/icon_stats/warning.png',
          statusText: '警告',
          waterLevel: 1.2,
          power: 22.1,
          switchStatus: 'on',
          updateTime: '2024-01-20 14:25:45'
        },
        {
          deviceName: '控制设备-004',
          status: 'offline',
          statusIcon: '/static/icon_stats/offline.png',
          statusText: '离线',
          waterLevel: 0,
          power: 0,
          switchStatus: 'off',
          updateTime: '2024-01-20 13:45:30'
        }
      ]
    }
  },
  computed: {
    // 过滤后的数据
    filteredData() {
      if (!this.searchKeyword) {
        return this.deviceData
      }
      
      const keyword = this.searchKeyword.toLowerCase()
      return this.deviceData.filter(item => 
        item.deviceName.toLowerCase().includes(keyword) ||
        item.waterLevel.toString().includes(keyword) ||
        item.power.toString().includes(keyword) ||
        item.status.toLowerCase().includes(keyword)
      )
    }
  },
  methods: {
    // 搜索处理
    handleSearch() {
      console.log('搜索关键词:', this.searchKeyword)
    },
    
    // 导航到对应页面
    navigateTo(nav) {
      if (this.currentPage === nav.page) return
      
      this.currentPage = nav.page
      
      if (nav.page === 'stats') {
        // 当前页面，不跳转
        return
      }
      
      // 使用 switchTab 跳转到 tabBar 页面
      uni.switchTab({
        url: nav.url,
        success: () => {
          console.log(`跳转到${nav.text}页面`)
        },
        fail: (err) => {
          console.log('跳转失败:', err)
          // 如果 switchTab 失败，尝试使用 navigateTo
          uni.navigateTo({
            url: nav.url
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.stats-container {
  padding: 30rpx;
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx; /* 为底部导航留出空间 */
}

/* 第一行样式 */
.stats-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40rpx;
}

.stat-card {
  flex: 1;
  background: white;
  border-radius: 16rpx;
  padding: 30rpx 20rpx;
  margin: 0 10rpx;
  text-align: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  position: relative;
}

.stat-value {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.stat-label {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.stat-trend {
  display: flex;
  justify-content: center;
  align-items: center;
}

.trend-icon {
  width: 28rpx;
  height: 28rpx;
}

/* 第二行样式 */
.search-row {
  background: white;
  border-radius: 16rpx;
  margin-bottom: 40rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.search-section {
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.section-label {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  flex: 1;
  height: 80rpx;
  background: #f8f9fa;
  border-radius: 40rpx;
  padding: 0 80rpx 0 30rpx;
  font-size: 28rpx;
}

.placeholder {
  color: #999;
}

.search-icon {
  position: absolute;
  right: 30rpx;
  width: 32rpx;
  height: 32rpx;
}

/* 数据显示区域 */
.data-display {
  height: 600rpx;
}

.data-content {
  height: 100%;
  padding: 20rpx 30rpx;
}

.data-item {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  border-left: 8rpx solid #1890ff;
}

.data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.device-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.device-status {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  gap: 8rpx;
}

.status-icon {
  width: 20rpx;
  height: 20rpx;
}

.device-status.online {
  background: #f6ffed;
  color: #52c41a;
  border: 1rpx solid #b7eb8f;
}

.device-status.offline {
  background: #f5f5f5;
  color: #999;
  border: 1rpx solid #d9d9d9;
}

.device-status.warning {
  background: #fff2e8;
  color: #fa541c;
  border: 1rpx solid #ffbb96;
}

.data-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.data-param {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.param-icon {
  width: 24rpx;
  height: 24rpx;
}

.param-label {
  font-size: 24rpx;
  color: #666;
  min-width: 120rpx;
}

.param-value {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
  flex: 1;
  text-align: right;
}

.param-value.on {
  color: #52c41a;
}

.param-value.off {
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
}

.empty-icon {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 20rpx;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

/* 底部导航栏样式 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: white;
  border-top: 1rpx solid #eee;
  padding: 20rpx 0;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.06);
  z-index: 1000;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10rpx 0;
  transition: all 0.3s ease;
}

.nav-item.active {
  color: #1890ff;
}

.nav-item:active {
  background: #f8f9fa;
}

.nav-icon {
  margin-bottom: 8rpx;
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon-img {
  width: 100%;
  height: 100%;
  transition: all 0.3s ease;
}

.nav-text {
  font-size: 22rpx;
  color: #666;
  transition: all 0.3s ease;
}

.nav-item.active .nav-text {
  color: #1890ff;
  font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .stats-container {
    padding: 20rpx;
    padding-bottom: 120rpx;
  }
  
  .stats-row {
    flex-direction: column;
    gap: 20rpx;
  }
  
  .stat-card {
    margin: 0;
  }
  
  .data-details {
    grid-template-columns: 1fr;
  }
}
</style>