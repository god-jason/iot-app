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
import { mapState } from 'pinia'
import { post } from '../../utils/request';
import { encodeBase32 } from 'geohashing';
import { userStore } from '../../store'

export default {
  data() {
    return {
      // 地图中心点（默认南京 GCJ02，未获取定位也使用）
      mapCenter: {
        latitude: 32.054783, // 南京 WGS84 转 GCJ02 近似
        longitude: 118.803909
      },
      // 兜底中心点（WGS84，用于计算与请求）
      fallbackCenter: {
        latitude: 32.060255,
        longitude: 118.796877
      },
      // 地图缩放级别
      scale: 14,
      // 地图标记点
      markers: [],
      // 折线（设备连线）
      polyline: [],
      // 当前坐标（WGS84，用于查询/计算）
      currentLocation: null,
      // 当前坐标（GCJ02，用于地图展示）
      currentLocationGcj: null,
      // 选中的设备
      selectedDevice: null,
      // 设备数据（用于点击标记时查找）
      deviceList: [],
      // 当前页面
      currentPage: 'maps',
      // 加载状态
      isLoading: true,
      // 显示权限提示
      showPermissionTip: false,
      // 地图上下文
      mapContext: null,
      // 当前组织
      groupId: null
    }
  },
  computed: {
    ...mapState(userStore, ['user', 'group'])
  },
  onLoad() {
    this.syncGroupFromStore()
    this.initMap()
  },

  onShow() {
    // 页面显示时重新检查权限
    this.checkLocationPermission()
    this.syncGroupFromStore()
  },
  methods: {
    // 同步 store 中的组织信息
    syncGroupFromStore() {
      this.groupId = this.group && this.group.id ? this.group.id : null
    },
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
        
          this.showPermissionTip = true
          this.isLoading = false
        } else {
         
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
        type: 'wgs84',
        altitude: true,
        success: (res) => {
          console.log('获取位置成功:', res)
          this.currentLocation = {
            latitude: res.latitude,
            longitude: res.longitude
          }
          const gcj = this.wgs84ToGcj02(res.latitude, res.longitude)
          this.currentLocationGcj = gcj
          this.mapCenter = gcj
          this.isLoading = false
          this.showPermissionTip = false
          
          // 添加当前位置标记
          this.addCurrentLocationMarker(gcj.latitude, gcj.longitude)

          // 重新按当前位置加载附近设备
          this.loadDeviceData()
        },
        fail: (err) => {
          console.log('获取位置失败:', err)
          this.isLoading = false
          // 使用南京兜底坐标继续加载设备
          if (!this.currentLocation) {
            this.currentLocation = { ...this.fallbackCenter }
            const gcj = this.wgs84ToGcj02(this.fallbackCenter.latitude, this.fallbackCenter.longitude)
            this.currentLocationGcj = gcj
            this.mapCenter = gcj
            this.loadDeviceData()
          }
          
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
    
    // 加载设备数据（按 geo 前缀与缩放动态限制数量）
    async loadDeviceData() {
      const location = this.currentLocation || this.fallbackCenter
      const displayLocation = this.currentLocationGcj || this.mapCenter || this.wgs84ToGcj02(this.fallbackCenter.latitude, this.fallbackCenter.longitude)
      this.isLoading = true
      try {
        const geoPrefix = this.buildGeoPrefix(location.latitude, location.longitude, this.scale)
        const limit = this.getLimitByScale(this.scale)

        const filter = {}
        if (this.groupId) filter.group_id = this.groupId
        if (geoPrefix) filter.geo_code = `${geoPrefix}%`

     
        const fields = ['id', 'longitude', 'latitude', 'online', 'name']

        let res = await post('table/device/search', {
          filter,
          limit,
          fields
        })

        // 若按 geo 前缀无结果，则退化为仅按组织过滤
        if (!res.data || res.data.length === 0) {
          const fallbackFilter = {}
          if (this.groupId) fallbackFilter.group_id = this.groupId
          res = await post('table/device/search', { filter: fallbackFilter, limit, fields })
        }

        const devices = res.data || []

        // 过滤并处理设备数据：只显示有有效位置信息的设备
        const processed = devices
          .filter(d => {
            const lat = Number(d.latitude)
            const lon = Number(d.longitude ?? d.longtitude)
            return Number.isFinite(lat) && Number.isFinite(lon)
          })
          .map(d => {
            const lat = Number(d.latitude)
            const lon = Number(d.longitude ?? d.longtitude)
            const distance = this.calcDistanceKm(location.latitude, location.longitude, lat, lon)
            const gcj = this.wgs84ToGcj02(lat, lon)
            return {
              ...d,
              // 保留原始字符串以便完整显示
              latRaw: d.latitude,
              lonRaw: d.longitude ?? d.longtitude,
              latitude: lat,
              longitude: lon,
              latitudeGcj: gcj.latitude,
              longitudeGcj: gcj.longitude,
              distance
            }
          })
          .sort((a, b) => (a.distance || 0) - (b.distance || 0))

        // 保存设备数据
        this.deviceList = processed

        // 生成地图标记
        const deviceMarkers = processed.map(d => {
          // 构建标记气泡内容：设备名称 + 位置名称（如果有）+ 距离
          let calloutContent = d.name || `设备-${d.id}`
          if (d.location) {
            calloutContent += `\n${d.location}`
          }
          if (d.distance !== null && d.distance !== undefined) {
            calloutContent += `\n距离: ${d.distance}km`
          }
          
          return {
            id: d.id,
            latitude: d.latitudeGcj,
            longitude: d.longitudeGcj,
            title: d.name || `设备-${d.id}`,
           
            iconPath: '/static/tabs/map.png',
            width: 32,
            height: 32,
            callout: {
              content: calloutContent,
              bgColor: '#ffffff',
              padding: 10,
              borderRadius: 8,
              display: 'ALWAYS'
            }
          }
        })

      
        if (displayLocation) {
          deviceMarkers.unshift({
            id: 0,
            latitude: displayLocation.latitude,
            longitude: displayLocation.longitude,
            title: '我的位置',
            iconPath: '/static/tabs/map.png',
            width: 32,
            height: 32
          })
        }

        this.markers = deviceMarkers
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
      
      // 跳过当前位置标记（id为0）
      if (markerId === 0) return
      
      const device = this.deviceList.find(d => d.id === markerId)
      if (device) {
        this.selectedDevice = device
        this.moveToLocation(
          device.latitudeGcj || device.latitude,
          device.longitudeGcj || device.longitude
        )
        
        // 显示设备详情
        this.showDeviceDetail(device)
      }
    },
    
    // 显示设备详情
    showDeviceDetail(device) {
      const statusText = device.online === 1 ? '在线' : (device.online === 0 ? '离线' : '未知')
      
      // 构建详情内容
      let content = `设备状态: ${statusText}`
      if (device.location) {
        content += `\n位置: ${device.location}`
      }
      if (device.distance !== null && device.distance !== undefined) {
        content += `\n距离: ${device.distance}km`
      }
      if (device.latitude && device.longitude) {
        const latDisplay = device.latRaw !== undefined ? device.latRaw : device.latitude
        const lonDisplay = device.lonRaw !== undefined ? device.lonRaw : device.longitude
        content += `\n坐标: ${latDisplay}, ${lonDisplay}`
      }
      
      uni.showModal({
        title: device.name || `设备-${device.id}`,
        content: content,
        showCancel: false,
        confirmText: '确定'
      })
    },
    
    // 区域变化事件
    onRegionChange(e) {
      if (e.type === 'end') {
        const newScale = e.detail && Number.isFinite(e.detail.scale) ? e.detail.scale : this.scale
        const scaleChanged = newScale !== this.scale
        this.scale = newScale

        // 缩放变化时重新拉取（数量随缩放调整）
        if (scaleChanged) {
          this.loadDeviceData()
        }
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
    
    // 构建 geo_code 前缀，随缩放级别调整长度
    buildGeoPrefix(latitude, longitude, scale) {
      try {
        // 根据缩放级别设定 geohash 长度
        let len = 6
        if (scale >= 17) len = 8
        else if (scale >= 15) len = 7
        else if (scale >= 13) len = 6
        else if (scale >= 11) len = 5
        else len = 4

        // 生成完整 geohash，截取前缀
        const fullHash = encodeBase32(latitude, longitude)
        return fullHash ? fullHash.substring(0, len) : ''
      } catch (e) {
        console.error('生成 geohash 失败:', e)
        return ''
      }
    },

    // 根据缩放动态调整请求数量，缩放越大取越多
    getLimitByScale(scale) {
      if (scale >= 17) return 500
      if (scale >= 15) return 400
      if (scale >= 13) return 300
      if (scale >= 11) return 200
      return 150
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

    // WGS84 -> GCJ02（地图组件使用 GCJ02）
    wgs84ToGcj02(lat, lon) {
      if (this.outOfChina(lat, lon)) {
        return { latitude: lat, longitude: lon }
      }
      const a = 6378245.0
      const ee = 0.00669342162296594323

      let dLat = this.transformLat(lon - 105.0, lat - 35.0)
      let dLon = this.transformLon(lon - 105.0, lat - 35.0)
      const radLat = lat / 180.0 * Math.PI
      let magic = Math.sin(radLat)
      magic = 1 - ee * magic * magic
      const sqrtMagic = Math.sqrt(magic)
      dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI)
      dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI)
      const mgLat = lat + dLat
      const mgLon = lon + dLon
      return { latitude: Number(mgLat.toFixed(6)), longitude: Number(mgLon.toFixed(6)) }
    },

    outOfChina(lat, lon) {
      return lon < 72.004 || lon > 137.8347 || lat < 0.8293 || lat > 55.8271
    },

    transformLat(x, y) {
      let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x))
      ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0
      ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0
      ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0
      return ret
    },

    transformLon(x, y) {
      let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x))
      ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0
      ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0
      ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0
      return ret
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