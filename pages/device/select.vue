<template>
	<view class="page">

		<!-- 有设备的情况 -->
		<uni-card v-if="devices.length> 0">

			<checkbox-group @change="selectChange">
				<view class="device" v-for="(device, index) in devices" :key="device.id">
					<label>
						<checkbox :value="device.id" />
						<text>{{device.id}} </text>
						<text>{{device.name}} </text>
						<text>{{device.online?'[在线]':'[离线]'}}</text>
					</label>
				</view>
			</checkbox-group>
		</uni-card>

		<!-- 没有设备的情况 -->
		<view v-else-if="!loading" class="empty-state">
			<view class="empty-content">
				<uni-icons type="device" size="80" color="#ccc"></uni-icons>
				<text class="empty-text">暂无设备</text>
			</view>
		</view>

		<!-- 加载状态 -->
		<view v-if="loading" class="loading-state">
			<uni-load-more status="loading" content="加载中..."></uni-load-more>
		</view>

		<uni-card>
			<button type="primary" @click="submit">选好了</button>
		</uni-card>
		

	</view>
</template>

<script>
	import {
		mapState
	} from 'pinia';
	import {
		userStore
	} from '../../store';
	import {
		get,
		post
	} from '../../utils/request';

	const user = userStore()

	export default {
		data() {
			return {
				pageSize: 9999,
				keyword: '',
				devices: [],
				loading: false,				
				selects: []
			}
		},
		computed: {
			...mapState(userStore, ['user', 'group']),
		},
		onLoad() {
			//this.loadDeviceData();
			this.load().then()
			this.eventChannel = this.getOpenerEventChannel();			
		},
		onShow() {

			//有变化重新加载
			const currentGroupId = this.group && this.group.id ? this.group.id : undefined
			if (this.last_group_id != currentGroupId) {
				if (currentGroupId) {
					this.loadStats().then()
					this.refresh().then()
				}
				this.last_group_id = currentGroupId
			}
		},
		onPullDownRefresh() {
			this.keyword = ''
			this.refresh().finally(() => {
				uni.stopPullDownRefresh();
			});
		},
		methods: {
			//统一加载
			async load() {
				//先加载（仅在有组织时加载）
				if (this.group && this.group.id) {
					this.loadDevices().then()
					this.last_group_id = this.group.id
				}
			},

			//加载设备
			async loadDevices() {
				if (!this.group || !this.group.id) {
					return
				}
				let filter = {
					group_id: this.group.id
				}
				if (this.keyword) {
					filter.$or = {
						id: "%" + this.keyword + "%",
						name: "%" + this.keyword + "%",
					}
				}
				let res = await post("table/device/search", {
					filter: filter,
					skip: this.devices.length,
					limit: this.pageSize,
				})

				if (res.data && res.data.length > 0) {
					this.devices = this.devices.concat(res.data)
					this.total = res.total
				}

				if (!res.data || !res.data.length || res.data.length < this.pageSize) {
					//没有了
				}
			},
			async refresh() {
				this.devices = []
				await this.loadDevices()
			},
			// 搜索
			search($event) {
				this.keyword = $event.value
				this.refresh()
			},
			cancelSearch() {
				this.keyword = ''
				this.refresh()
			},

			// 格式化日期
			formatDate(dateString) {
				if (!dateString) return '未知';
				try {
					const date = new Date(dateString);
					return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
				} catch (e) {
					return dateString;
				}
			},
			
			selectChange($event){
				this.selects = $event.detail.value
			},
			submit(){
				//console.log("submit", this.selects)
				uni.navigateBack({
					// animationType: "none",
					// animationDuration: 0
				})
				//setTimeout(()=>{
					this.eventChannel.emit("devices", this.selects)
				//}, 100)
				
			}
			
		}
	}
</script>

<style lang="scss" scoped>

	.device {
		padding: 10rpx;
	}

	.device-info {
		padding: 10rpx 0;

		.info-item {
			display: block;
			font-size: 26rpx;
			color: #666;
			margin-bottom: 8rpx;

			&:last-child {
				margin-bottom: 0;
			}
		}
	}

	.empty-state {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 400rpx;

		.empty-content {
			text-align: center;

			.empty-text {
				display: block;
				font-size: 32rpx;
				color: #999;
				margin-top: 20rpx;
			}

			.empty-desc {
				display: block;
				font-size: 28rpx;
				color: #ccc;
				margin-top: 10rpx;
			}
		}
	}

	.loading-state {
		padding: 40rpx 0;
		text-align: center;
	}
</style>