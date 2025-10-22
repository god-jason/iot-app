<template>
	<view class="container">

		<uni-grid :column="3" :show-border="false" :square="false">
			<uni-grid-item>
				<uni-card title="设备总数"> 100 </uni-card>
			</uni-grid-item>
			<uni-grid-item>
				<uni-card title="在线数量"> 97 </uni-card>
			</uni-grid-item>
			<uni-grid-item>
				<uni-card title="离线数量"> 3 </uni-card>
			</uni-grid-item>
		</uni-grid>

		<uni-section title="设备列表" type="square">
			<uni-search-bar placeholder="快捷搜索" @confirm="search"></uni-search-bar>
		</uni-section>

		<uni-card v-for="(device, index) in devices" @click="open(device)" :title="device.name" :sub-title="device.id"
			:extra="device.online?'在线':'离线'" thumbnail="/static/device.png">
			<device-values @property-click="onPropertyClick(device, $event)" :device="device.id"
				:product="device.product_id" type="list"></device-values>
		</uni-card>

	</view>

</template>

<script>
	export default {
		data() {
			return {
				// 搜索关键词
				searchKeyword: '',

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
					url: "/pages/device/detail?id=" + device.id,
				})
			},

			onPropertyClick(device, property) {
				//alert(JSON.stringify(property))
			},

		}
	}
</script>

<style scoped>
	.item {
		text-align: center;
		padding: 5rpx 0;
	}
</style>