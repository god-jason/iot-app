<template>
	<view>

		<uni-search-bar placeholder="搜索" @confirm="search"></uni-search-bar>

		<uni-grid :column="3" :show-border="false" :square="false">
			<uni-grid-item>
				<view class="item">
					<view class="label">总数</view>
					<view class="num"> {{total}} </view>
				</view>
			</uni-grid-item>
			<uni-grid-item>
				<view class="item">
					<view class="label">在线</view>
					<view class="num"> {{online}} </view>
				</view>
			</uni-grid-item>
			<uni-grid-item>
				<view class="item">
					<view class="label">离线</view>
					<view class="num"> {{offline}} </view>
				</view>
			</uni-grid-item>
		</uni-grid>

		<uni-section title="设备列表" type="square">
		</uni-section>

		<uni-card v-for="(device, index) in devices" @click="open(device)" :title="device.name" :sub-title="device.id"
			:extra="device.online?'在线':'离线'" thumbnail="/static/device.png"
			:style="{backgroundColor: (device.online ? '': '#f6f6f6')}">
			<device-values @property-click="onPropertyClick(device, $event)" :device="device.id"
				:product="device.product_id" type="list"></device-values>
		</uni-card>

	</view>

</template>

<script>
	export default {
		data() {
			return {
				total: 100,
				online: 97,
				offline: 3,

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
			changeGroup(event) {
				//console.log("changeGroup", event)
				this.index = event.detail.value;
			},
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

<style lang="scss" scoped>
	.group {
		padding: 5rpx 20rpx;
	}

	.item {
		color: #808080;
		text-align: center;

		.label {}

		.num {
			color: #1296db;
			font-size: 1.5em;
			font-weight: bold;
			padding: 15rpx 0;
		}
	}
</style>