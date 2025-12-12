<template>
	<view class="maps-container">
		<map id="tencentMap" :latitude="center.latitude" :longitude="center.longitude" theme="satellite"
			enable-satellite :markers="markers" :scale="scale" :show-location="true" provider="tencent"
			@markertap="onMarkerTap" @regionchange="onRegionChange" class="tencent-map" />
	</view>
</template>

<script>
	import convert from 'wzlcoordconvert';
	import {
		mapState
	} from 'pinia'
	import {
		post
	} from '../../utils/request';
	import {
		encodeBase32
	} from 'geohashing';
	import {
		userStore
	} from '../../store'
	import {
		calcDistanceKm
	} from '../../utils/gps';

	export default {
		data() {
			return {
				//当前定位 GPS（本易物联网）
				location: {
					latitude: 32.024735,
					longitude: 118.902965
				},

				// 地图中心点 GCJ
				center: {
					latitude: 32.024735,
					longitude: 118.902965
				},

				// 地图缩放级别
				scale: 10,

				// 地图标记点
				markers: [],

				// 折线（设备连线）
				polyline: [],

				// 设备数据（用于点击标记时查找）
				deviceList: [],

				// 地图上下文				
				mapContext: null,
			}
		},
		computed: {
			...mapState(userStore, ['user', 'group'])
		},

		onLoad() {

			this.mapContext = uni.createMapContext('tencentMap', this)
		},

		onShow() {
			// #ifdef MP
			uni.authorize({
				scope: 'scope.userLocation',
				success: () => {
					this.getLocation()
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
			// #endif

			//H5直接获取当前位置
			// #ifndef MP
			this.getLocation()
			// #endif	
		},

		methods: {

			getLocation() {
				uni.getLocation({
					type: 'wgs84',
					altitude: true,
					success: (res) => {
						console.log('获取位置成功:', res)
						this.location = {
							latitude: res.latitude,
							longitude: res.longitude
						}

						const coord = convert.wgs84ToGcj02(res.longitude, res.latitude);
						this.center = {
							longitue: coord[0],
							latitude: coord[1],
						}

						this.loadDeviceData()
					},
					fail: (err) => {
						console.log('获取位置失败:', err)
						//this.center = wgs84ToGcj02(this.location.latitude, this.location.longitude)
						const coord = convert.wgs84ToGcj02(res.longitude, res.latitude);
						this.center = {
							longitue: coord[0],
							latitude: coord[1],
						}

						this.loadDeviceData()
					}
				})
			},

			// 加载设备数据（按 geo 前缀与缩放动态限制数量）
			async loadDeviceData() {

				try {

					let geoPrefix = this.buildGeoPrefix(this.location.latitude, this.location.longitude, this.scale)

					const filter = {
						geo_code: `${geoPrefix}%`,
						group_id: this.group.id
					}

					let res = await post('table/device/search', {
						filter,
						limit: 2000,
						fields: ['id', 'longitude', 'latitude', 'online', 'name']
					})

					const devices = res.data || []
					
					if (devices.length == 0) return

					// 过滤并处理设备数据：只显示有有效位置信息的设备
					this.deviceList = devices
						.filter(d => {
							const lat = Number(d.latitude)
							const lon = Number(d.longitude)
							return Number.isFinite(lat) && Number.isFinite(lon)
						})
						.map(d => {

							const lat = Number(d.latitude)
							const lon = Number(d.longitude)
							d.distance = calcDistanceKm(this.location.latitude, this.location.longitude, lat,
								lon)

							//d.gcj = wgs84ToGcj02(lat, lon)							
							const coord = convert.wgs84ToGcj02(d.longitude, d.latitude);
							d.gcj = {
								longitude: coord[0],
								latitude: coord[1],
							}
							console.log("gcj", d.gcj)

							return d
						})
					//.sort((a, b) => (a.distance || 0) - (b.distance || 0))


					// 生成地图标记
					this.markers = this.deviceList.map((d, i) => {

						let calloutContent = d.name || d.id
						if (d.distance !== null && d.distance !== undefined) {
							//calloutContent += `\n距离: ${d.distance}km`
							//calloutContent += `\n${d.gcj.longitude}`
							//calloutContent += `\n${d.gcj.latitude}`
						}

						return {
							id: i,
							latitude: d.gcj.latitude,
							longitude: d.gcj.longitude,
							title: d.name || d.id,
							iconPath: d.online ? '/static/pt3.png' : '/static/pt4.png',
							width: 32,
							height: 32,
							callout: {
								content: calloutContent,
								bgColor: '#ffffff',
								padding: 3,
								borderRadius: 2,
								display: 'ALWAYS'
							}
						}
					})

				} catch (error) {
					console.error('加载设备数据失败:', error)
				} finally {
					this.isLoading = false
				}
			},

			// 标记点点击事件
			onMarkerTap(e) {
				const markerId = e.markerId
				console.log('点击标记:', markerId)

				const device = this.deviceList[markerId]
				if (device) {
					this.selectedDevice = device
					//this.moveToLocation(device.gcj.latitude, device.gcj.longitude)

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
					cancelText: "关闭",
					confirmText: '打开',
					success:(e)=>{
						if (e.confirm)
							uni.navigateTo({
								url: "/pages/device/detail?id="+device.id
							})
					}
				})
			},

			// 区域变化事件
			onRegionChange(e) {
				//console.log("onRegionChange", e.detail.scale)
				if (e.type === 'end') {
					
					const scaleDiff = Math.abs(this.scale - e.detail.scale)
					const distance = calcDistanceKm(this.center.latitude, this.center.longitude,
							e.detail.centerLocation.latitude, e.detail.centerLocation.longitude)
					
					let changed = false
					if (scaleDiff >= 1.2)
						changed = true
					
					if (!changed) {
						if (e.detail.scale > 17 && distance > 1 ||
							e.detail.scale > 14 && distance > 5 ||
							e.detail.scale > 10 && distance > 10 ||
							e.detail.scale > 8 && distance > 50 ||
							e.detail.scale > 6 && distance > 100)
							changed = true
					}
					
						
					console.log("onRegionChanged", changed, scaleDiff, distance)
					//console.log(e.detail.scale, e.detail.centerLocation)

					this.scale = e.detail.scale;
					this.center = e.detail.centerLocation;


					const pt = convert.gcj02ToWgs84(this.center.longitude, this.center.latitude);
					//console.log("gcj02ToWgs84", this.center, pt)
					this.location = {
						longitude: pt[0],
						latitude: pt[1]
					}

					// 缩放变化时重新拉取（数量随缩放调整）
					if (changed)
						this.loadDeviceData()
				}
			},

			// 移动到指定位置
			moveToLocation(latitude, longitude) {
				this.center = {
					latitude,
					longitude
				}
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
					if (scale > 17) len = 6
					else if (scale > 14) len = 5
					else if (scale > 10) len = 4
					else if (scale > 8) len = 3
					else if (scale > 6) len = 2
					else if (scale > 4) len = 1
					else len = 1

					// 生成完整 geohash，截取前缀
					const fullHash = encodeBase32(latitude, longitude)
					return fullHash ? fullHash.substring(0, len) : ''
				} catch (e) {
					console.error('生成 geohash 失败:', e)
					return ''
				}
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

<style lang="scss" scoped>
	.maps-container {
		width: 100vw;
		height: 100vh;
		//height: 100%;
		//display: flex;
		flex-direction: column;
		background: #f5f5f5;
	}

	.tencent-map {
		width: 100%;
		height: 100%;
	}
</style>