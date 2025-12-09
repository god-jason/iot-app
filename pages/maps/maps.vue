<template>
  <view class="maps-container">
    <!-- 第一行：腾讯地图 -->
    <view class="map-section">
      <view class="map-header">
        <text class="map-title">设备位置监控</text>
        <view class="device-count">
          <text>设备数量: {{ markers.length }}</text>
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
        />
      </view>
    </view>

  </view>
</template>

<script>
import { post } from '../../utils/request';
import geohash from 'geohashing';

export default {
  data() {
    return {
      // 地图中心点（默认北京）
      mapCenter: {
        latitude: 39.916527,
        longitude: 116.397128
      },
      // 地图缩放级别
      scale: 14,
      // 地图标记点
      markers: [],
      // 折线（设备连线）
      polyline: [],
      // 当前坐标
      currentLocation: null,
      // 选中的设备
      selectedDevice: null,
      // 当前页面
      currentPage: 'maps',
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
          this.currentLocation = {
            latitude: res.latitude,
            longitude: res.longitude
          }
          this.mapCenter = {
            latitude: res.latitude,
            longitude: res.longitude
          }
          this.isLoading = false
          this.showPermissionTip = false
          
          // 添加当前位置标记
          this.addCurrentLocationMarker(res.latitude, res.longitude)

          // 重新按当前位置加载附近设备
          this.loadDeviceData()
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
        width: 32,
        height: 32
      }
      
      // 添加到标记数组开头
      this.markers.unshift(currentLocationMarker)
    },
    
    // 加载设备数据（按 geo_code 前缀就近查询，若失败则全量）
    async loadDeviceData() {
      if (!this.currentLocation) {
        uni.showToast({ title: '未获取到位置', icon: 'none' })
        return
      }

      this.isLoading = true
      try {
        const prefix = this.buildGeoPrefix(this.currentLocation.latitude, this.currentLocation.longitude)
        let res = await post('table/device/search', {
          filter: prefix ? { geo_code: prefix } : {},
          limit: 200
        })

        // 若按前缀无结果，降级全量
        if (!res.data || res.data.length === 0) {
          res = await post('table/device/search', { filter: {}, limit: 200 })
        }

        const devices = res.data || []

        // 计算距离并排序
        const processed = devices
          .filter(d => d.latitude && d.longitude)
          .map(d => {
            const distance = this.calcDistanceKm(this.currentLocation.latitude, this.currentLocation.longitude, d.latitude, d.longitude)
            return {
              ...d,
              distance
            }
          })
          .sort((a, b) => (a.distance || 0) - (b.distance || 0))

        this.markers = processed.map(d => ({
          id: d.id,
          latitude: d.latitude,
          longitude: d.longitude,
          title: d.name || `设备-${d.id}`,
          callout: {
            content: `${d.name || '设备'}${d.distance !== null && d.distance !== undefined ? `\n距离: ${d.distance}km` : ''}`,
            bgColor: '#ffffff',
            padding: 10,
            borderRadius: 8,
            display: 'ALWAYS'
          }
        }))
      } catch (error) {
        console.error('加载设备数据失败:', error)
        uni.showToast({
          title: '设备加载失败',
          icon: 'none'
        })
      } finally {
        this.isLoading = false
      }
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
    
    // 构建 geo_code 前缀
    buildGeoPrefix(latitude, longitude) {
      try {
        // 取 6 位 geohash，作为附近区域前缀
        return geohash.encode(latitude, longitude, 6)
      } catch (e) {
        console.error('生成 geohash 失败:', e)
        return ''
      }
    },

    // 计算两点距离（km）
    calcDistanceKm(lat1, lon1, lat2, lon2) {
      const toRad = (deg) => deg * Math.PI / 180
      const R = 6371
      const dLat = toRad(lat2 - lat1)
      const dLon = toRad(lon2 - lon1)
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return Number((R * c).toFixed(2))
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