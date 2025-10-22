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

		<uni-card v-for="(device, index) in devices" @click="open(device)"
		 :title="device.name" :sub-title="device.id" :extra="device.online?'在线':'离线'"
			thumbnail="/static/device.png">
			<device-values
			 @property-click="onPropertyClick(device, $event)"
			 :device="device.id"
			 :product="device.product_id"
			 type="simple"></device-values>
		</uni-card>

	</view>

</template>

<script>
	export default {
		data() {
			return {
				
				// 设备统计数据
				deviceStats: [{
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
				devices: [{
						id: "123123",
						name: '发电设备-003',
						online: true,
						switchStatus: 'on',
						updateTime: '2024-01-20 14:30:25'
					},
					{
						id: "123124",
						name: '温控设备-004',
						switchStatus: 'off',
						updateTime: '2024-01-20 14:28:10'
					},
					{
						id: "123125",
						name: '水泵设备-005',
						online: true,
						switchStatus: 'on',
						updateTime: '2024-01-20 14:25:45'
					},
					{
						id: "123126",
						name: '控制设备-006',
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
					item.name.toLowerCase().includes(keyword) ||
					item.waterLevel.toString().includes(keyword) ||
					item.power.toString().includes(keyword) ||
					item.status.toLowerCase().includes(keyword)
				)
			}
		},
		onPullDownRefresh() {
			uni.stopPullDownRefresh()
			//TODO 加载
		},
		onReachBottom() {
			console.log("bottom")
			//TODO 加载更多
		},
		mounted() {
			//TODO 加载
		},
		methods: {
			open(device) {
				uni.navigateTo({
					url: "/pages/device/detail?id="+device.id,
				})
			},
			
			onPropertyClick(device, property) {
				//alert(JSON.stringify(property))
			},
			
		}
	}
</script>

<style scoped>
	
</style>