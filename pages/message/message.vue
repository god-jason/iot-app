<template>
	<view class="container">

		<uni-card v-for="(message, index) in messages"
		 @click="open(message)"
		  :title="message.title"
			:extra="message.updateTime">
			{{message.message}}
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
				messages: [{
						id: "123123",
						title: '设备离线',
						message: '发电设备-003',
						updateTime: '2024-01-20 14:30:25'
					},
					{
						id: "123124",
						title: '设备离线',
						message: '温控设备-004',
						updateTime: '2024-01-20 14:28:10'
					},
					{
						id: "123125",
						title: '设备离线',
						message: '水泵设备-005',
						updateTime: '2024-01-20 14:25:45'
					},
					{
						id: "123126",
						title: '设备离线',
						message: '控制设备-006',
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
			open(message) {
				uni.navigateTo({
					url: "/pages/message/detail?id=" + message.id,
				})
			},

			onPropertyClick(message, property) {
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