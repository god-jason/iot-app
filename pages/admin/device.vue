<template>
	<view>
		<uni-search-bar placeholder="搜索" @confirm="search"></uni-search-bar>

		<uni-list>
			<uni-list-item v-for="(device, index) in devices" :key="device.id" :title="device.name" :note="device.id"
				clickable link="navigateTo" :to="'/pages/device/detail?id='+device.id">
			</uni-list-item>
		</uni-list>
		
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

		}
	}
</script>

<style lang="scss" scoped>
</style>