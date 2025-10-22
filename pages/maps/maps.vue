<template>
  <view class="maps-container">
    <!-- 第一行：腾讯地图 -->
    <view class="map-section">
      <view class="map-header">
        <text class="map-title">设备位置监控</text>
        <view class="device-count">
          <image class="count-icon" src="/static/icon_maps/online.png" mode="aspectFit"></image>
          <text>在线设备: {{ onlineDevices.length }}</text>
        </view>
      </view>
      
      <!-- 腾讯地图组件 -->
      <view class="map-wrapper">
        <map 
          id="tencentMap"
          :latitude="mapCenter.latitude"
          :longitude="mapCenter.longitude"
          :markers="markers"
          :polyline="polyline"
          :scale="scale"
          :show-location="true"
		  provider="tencent"
          @markertap="onMarkerTap"
          @regionchange="onRegionChange"
          class="tencent-map"
        >
          <!-- 地图控件 -->
          <cover-view class="map-controls">
            <cover-view class="control-group">
              <cover-view class="control-btn" @click="zoomIn">
                <cover-image src="/static/icon_maps/zoom-in.png" class="control-icon"></cover-image>
              </cover-view>
              <cover-view class="control-btn" @click="zoomOut">
                <cover-image src="/static/icon_maps/zoom-out.png" class="control-icon"></cover-image>
              </cover-view>
            </cover-view>
            <cover-view class="control-btn location-btn" @click="moveToCurrentLocation">
              <cover-image src="/static/icon_maps/location.png" class="control-icon"></cover-image>
            </cover-view>
          </cover-view>
        </map>
        
        <!-- 设备列表面板 -->
        <view class="device-panel" :class="{ collapsed: isPanelCollapsed }">
          <view class="panel-header" @click="togglePanel">
            <image class="panel-icon" src="/static/icon_maps/devices.png" mode="aspectFit"></image>
            <text class="panel-title">设备列表</text>
            <image class="collapse-icon" :src="isPanelCollapsed ? '/static/icon_maps/collapse-right.png' : '/static/icon_maps/collapse-down.png'" mode="aspectFit"></image>
          </view>
          <scroll-view class="panel-content" scroll-y v-if="!isPanelCollapsed">
            <view 
              v-for="device in onlineDevices" 
              :key="device.id"
              class="device-item"
              :class="{ active: selectedDevice && selectedDevice.id === device.id }"
              @click="selectDevice(device)"
            >
              <view class="device-info">
                <view class="device-name-section">
                  <image class="device-icon" :src="device.statusIcon" mode="aspectFit"></image>
                  <text class="device-name">{{ device.name }}</text>
                </view>
                <view class="device-status" :class="device.status">
                  <text class="device-status-text">{{ device.statusText }}</text>
                </view>
              </view>
              <view class="device-distance">
                <image class="distance-icon" src="/static/icon_maps/distance.png" mode="aspectFit"></image>
                <text>{{ device.distance }}km</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <!-- 加载状态提示 -->
        <view class="loading-tip" v-if="isLoading">
          <view class="loading-content">
            <image class="loading-icon" src="/static/icon_maps/loading.png" mode="aspectFit"></image>
            <text>正在加载地图...</text>
          </view>
        </view>

        <!-- 权限提示 -->
        <!-- <view class="permission-tip" v-if="showPermissionTip">
          <view class="permission-content">
            <image class="permission-icon" src="/static/icon_maps/location.png" mode="aspectFit"></image>
            <text class="permission-title">需要位置权限</text>
            <text class="permission-desc">请授权位置权限以使用地图功能</text>
            <button class="permission-btn" @click="requestLocationPermission">授权位置权限</button>
          </view>
        </view> -->
      </view>
    </view>

    <!-- 第二行：底部导航 -->
    <view class="bottom-nav">
      <view 
        v-for="(nav, index) in navigation" 
        :key="index"
        class="nav-item"
        :class="{ active: currentPage === nav.page }"
        @click="navigateTo(nav)"
      >
        <view class="nav-icon">
          <image class="nav-icon-img" :src="nav.icon" mode="aspectFit"></image>
        </view>
        <text class="nav-text">{{ nav.text }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 地图中心点（示例坐标：北京市）
      mapCenter: {
        latitude: 39.916527,
        longitude: 116.397128
      },
      // 地图缩放级别
      scale: 14,
      // 地图标记点
      markers: [
        {
          id: 1,
          latitude: 39.916527,
          longitude: 116.397128,
          title: '设备001',
          iconPath: '/static/icon_maps/marker-online.png',
          width: 36,
          height: 36,
          callout: {
            content: '设备001\n状态: 在线\n温度: 25°C',
            bgColor: '#ffffff',
            padding: 10,
            borderRadius: 8,
            display: 'ALWAYS'
          }
        },
        {
          id: 2,
          latitude: 39.906527,
          longitude: 116.407128,
          title: '设备002',
          iconPath: '/static/icon_maps/marker-warning.png',
          width: 36,
          height: 36,
          callout: {
            content: '设备002\n状态: 警告\n水位: 1.2m',
            bgColor: '#fffbe6',
            padding: 10,
            borderRadius: 8,
            display: 'ALWAYS'
          }
        },
        {
          id: 3,
          latitude: 39.926527,
          longitude: 116.387128,
          title: '设备003',
          iconPath: '/static/icon_maps/marker-offline.png',
          width: 36,
          height: 36,
          callout: {
            content: '设备003\n状态: 离线',
            bgColor: '#f5f5f5',
            padding: 10,
            borderRadius: 8,
            display: 'ALWAYS'
          }
        }
      ],
      // 折线（设备连线）
      polyline: [{
        points: [
          { latitude: 39.916527, longitude: 116.397128 },
          { latitude: 39.906527, longitude: 116.407128 },
          { latitude: 39.926527, longitude: 116.387128 }
        ],
        color: '#1890ff',
        width: 4,
        dottedLine: true
      }],
      // 在线设备列表
      onlineDevices: [
        {
          id: 1,
          name: '水泵设备-001',
          status: 'online',
          statusIcon: '/static/icon_maps/status-online.png',
          statusText: '在线',
          distance: 0.5,
          latitude: 39.916527,
          longitude: 116.397128
        },
        {
          id: 2,
          name: '水箱设备-002',
          status: 'warning',
          statusIcon: '/static/icon_maps/status-warning.png',
          statusText: '警告',
          distance: 1.2,
          latitude: 39.906527,
          longitude: 116.407128
        },
        {
          id: 3,
          name: '控制设备-003',
          status: 'offline',
          statusIcon: '/static/icon_maps/status-offline.png',
          statusText: '离线',
          distance: 0.8,
          latitude: 39.926527,
          longitude: 116.387128
        }
      ],
      // 选中的设备
      selectedDevice: null,
      // 设备面板是否折叠
      isPanelCollapsed: false,
      // 当前页面
      currentPage: 'maps',
      // 底部导航
      navigation: [
        {
          text: '主页',
          page: 'stats',
          icon: '/static/icon_index/home.png',
          url: '/pages/index/index'
        },
        {
          text: '地图',
          page: 'maps',
          icon: '/static/icon_index/map.png',
          url: '/pages/maps/maps'
        },
        {
          text: '我的',
          page: 'users',
          icon: '/static/icon_maps/profile.png',
          url: '/pages/profile/profile'
        }
      ],
      // 加载状态
      isLoading: true,
      // 显示权限提示
      showPermissionTip: false,
      // 地图上下文
      mapContext: null
    }
  },
  onLoad() {
    this.initMap()
    this.loadDeviceData()
  },
  onShow() {
    // 页面显示时重新检查权限
    this.checkLocationPermission()
  },
  methods: {
    // 初始化地图
    initMap() {
      // 初始化地图上下文
      this.mapContext = uni.createMapContext('tencentMap', this)
      
      // 检查位置权限
      this.checkLocationPermission()
    },
    
    // 检查位置权限
    async checkLocationPermission() {
      try {
        const result = await new Promise((resolve, reject) => {
          uni.getSetting({
            success: resolve,
            fail: reject
          })
        })
        
        if (result.authSetting['scope.userLocation'] === false) {
          // 用户之前拒绝了权限
          this.showPermissionTip = true
          this.isLoading = false
        } else {
          // 有权限或未询问过
          this.getCurrentLocation()
        }
      } catch (error) {
        console.log('检查权限失败:', error)
        this.getCurrentLocation()
      }
    },
    
    // 请求位置权限
    requestLocationPermission() {
      uni.authorize({
        scope: 'scope.userLocation',
        success: () => {
          this.showPermissionTip = false
          this.getCurrentLocation()
        },
        fail: () => {
          uni.showModal({
            title: '权限提示',
            content: '需要位置权限才能使用地图功能，请前往设置页面开启权限',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) {
                uni.openSetting()
              }
            }
          })
        }
      })
    },
    
    // 获取当前位置
    getCurrentLocation() {
      this.isLoading = true
      
      uni.getLocation({
        type: 'gcj02',
        altitude: true,
        success: (res) => {
          console.log('获取位置成功:', res)
          this.mapCenter = {
            latitude: res.latitude,
            longitude: res.longitude
          }
          this.isLoading = false
          this.showPermissionTip = false
          
          // 添加当前位置标记
          this.addCurrentLocationMarker(res.latitude, res.longitude)
        },
        fail: (err) => {
          console.log('获取位置失败:', err)
          this.isLoading = false
          
          if (err.errMsg.includes('auth deny') || err.errMsg.includes('permission')) {
            this.showPermissionTip = true
          } else {
            uni.showToast({
              title: '获取位置失败',
              icon: 'none',
              duration: 2000
            })
            // 使用默认位置继续显示地图
            this.isLoading = false
          }
        }
      })
    },
    
    // 添加当前位置标记
    addCurrentLocationMarker(latitude, longitude) {
      const currentLocationMarker = {
        id: 0,
        latitude: latitude,
        longitude: longitude,
        title: '我的位置',
        iconPath: '/static/icon_maps/current-location.png',
        width: 32,
        height: 32
      }
      
      // 添加到标记数组开头
      this.markers.unshift(currentLocationMarker)
    },
    
    // 加载设备数据
    loadDeviceData() {
      // 模拟API调用获取设备数据
      setTimeout(() => {
        console.log('设备数据加载完成')
        // 这里可以添加实际的数据加载逻辑
      }, 1000)
    },
    
    // 标记点点击事件
    onMarkerTap(e) {
      const markerId = e.markerId
      console.log('点击标记:', markerId)
      
      const device = this.onlineDevices.find(d => d.id === markerId)
      if (device) {
        this.selectedDevice = device
        this.moveToLocation(device.latitude, device.longitude)
        
        // 显示设备详情
        this.showDeviceDetail(device)
      }
    },
    
    // 显示设备详情
    showDeviceDetail(device) {
      uni.showModal({
        title: device.name,
        content: `设备状态: ${device.statusText}\n距离: ${device.distance}km\n坐标: ${device.latitude.toFixed(6)}, ${device.longitude.toFixed(6)}`,
        showCancel: false,
        confirmText: '确定'
      })
    },
    
    // 区域变化事件
    onRegionChange(e) {
      if (e.type === 'end') {
        // 地图拖动结束，可以在这里加载新区域的设备
        console.log('地图区域变化', e)
        // 实际项目中可以在这里加载新区域的设备数据
      }
    },
    
    // 选择设备
    selectDevice(device) {
      this.selectedDevice = device
      this.moveToLocation(device.latitude, device.longitude)
    },
    
    // 移动到指定位置
    moveToLocation(latitude, longitude) {
      this.mapCenter = { latitude, longitude }
      this.scale = 16 // 放大级别
      
      // 使用地图上下文进行平滑移动
      if (this.mapContext) {
        this.mapContext.moveToLocation({
          latitude: latitude,
          longitude: longitude,
          success: () => {
            console.log('地图移动成功')
          }
        })
      }
    },
    
    // 移动到当前位置
    moveToCurrentLocation() {
      this.getCurrentLocation()
      this.scale = 14
    },
    
    // 放大
    zoomIn() {
      if (this.scale < 20) {
        this.scale += 1
      }
    },
    
    // 缩小
    zoomOut() {
      if (this.scale > 3) {
        this.scale -= 1
      }
    },
    
    // 切换设备面板
    togglePanel() {
      this.isPanelCollapsed = !this.isPanelCollapsed
    },
    
    // 导航到对应页面
    navigateTo(nav) {
      if (this.currentPage === nav.page) return
      
      this.currentPage = nav.page
      
      if (nav.page === 'maps') {
        // 当前页面，不跳转
        return
      }
      
      uni.switchTab({
        url: nav.url,
        success: () => {
          console.log(`跳转到${nav.text}页面`)
        },
        fail: (err) => {
          console.log('跳转失败:', err)
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
.maps-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

/* 地图区域 */
.map-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: white;
  border-bottom: 1rpx solid #eee;
}

.map-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.device-count {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #1890ff;
  background: #f0f8ff;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  gap: 8rpx;
}

.count-icon {
  width: 20rpx;
  height: 20rpx;
}

.map-wrapper {
  flex: 1;
  position: relative;
}

.tencent-map {
  width: 100%;
  height: 100%;
}

/* 地图控件 */
.map-controls {
  position: absolute;
  right: 30rpx;
  bottom: 200rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.control-group {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.control-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

.control-btn:active {
  background: #f0f0f0;
}

.location-btn {
  border-radius: 8rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.control-icon {
  width: 32rpx;
  height: 32rpx;
}

/* 设备面板 */
.device-panel {
  position: absolute;
  left: 30rpx;
  top: 30rpx;
  width: 420rpx;
  background: white;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 100;
}

.device-panel.collapsed {
  width: 200rpx;
}

.panel-header {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #eee;
  background: #fafafa;
  border-radius: 16rpx 16rpx 0 0;
  gap: 12rpx;
}

.panel-icon {
  width: 24rpx;
  height: 24rpx;
}

.panel-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.collapse-icon {
  width: 16rpx;
  height: 16rpx;
}

.panel-content {
  max-height: 400rpx;
  padding: 20rpx;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  background: #f8f9fa;
  border: 2rpx solid transparent;
  transition: all 0.2s ease;
}

.device-item.active {
  border-color: #1890ff;
  background: #f0f8ff;
}

.device-item:last-child {
  margin-bottom: 0;
}

.device-info {
  flex: 1;
}

.device-name-section {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
  gap: 10rpx;
}

.device-icon {
  width: 16rpx;
  height: 16rpx;
}

.device-name {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}

.device-status {
  display: inline-flex;
  align-items: center;
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.device-status.online {
  background: #f6ffed;
  color: #52c41a;
  border: 1rpx solid #b7eb8f;
}

.device-status.warning {
  background: #fff2e8;
  color: #fa541c;
  border: 1rpx solid #ffbb96;
}

.device-status.offline {
  background: #f5f5f5;
  color: #999;
  border: 1rpx solid #d9d9d9;
}

.device-distance {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #666;
  gap: 6rpx;
}

.distance-icon {
  width: 16rpx;
  height: 16rpx;
}

/* 加载提示 */
.loading-tip {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  padding: 40rpx;
  border-radius: 16rpx;
  gap: 20rpx;
}

.loading-icon {
  width: 60rpx;
  height: 60rpx;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 权限提示 */
.permission-tip {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.permission-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  padding: 50rpx;
  border-radius: 20rpx;
  margin: 40rpx;
  gap: 24rpx;
  text-align: center;
}

.permission-icon {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 10rpx;
}

.permission-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.permission-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}

.permission-btn {
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 50rpx;
  padding: 20rpx 60rpx;
  font-size: 28rpx;
  margin-top: 20rpx;
}

.permission-btn:active {
  background: #1479d6;
}

/* 底部导航 */
.bottom-nav {
  display: flex;
  background: white;
  border-top: 1rpx solid #eee;
  padding: 20rpx 0;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.06);
  z-index: 100;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10rpx 0;
}

.nav-item.active {
  color: #1890ff;
}

.nav-icon {
  margin-bottom: 8rpx;
}

.nav-icon-img {
  width: 40rpx;
  height: 40rpx;
}

.nav-text {
  font-size: 22rpx;
  color: #666;
}

.nav-item.active .nav-text {
  color: #1890ff;
  font-weight: bold;
}
</style>