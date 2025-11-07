<template>
	<view>
		<!-- 组织信息显示 -->
		<view v-if="group" class="organization-info" @click="openGroup">
			<text class="org-name">{{ group.name || '神秘组织' }}</text>
		</view>

		<view v-else class="no-organization">
			<uni-notice-bar show-icon text="您还没有加入任何组织，请联系管理员将您添加到组织中"></uni-notice-bar>
		</view>

		<uni-search-bar placeholder="搜索设备" @confirm="search" @cancel="cancelSearch"></uni-search-bar>

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

		<!-- 有设备的情况 -->
		<view v-if="devices.length > 0">
			<uni-card v-for="(device, index) in devices" :key="device.id" @click="open(device)"
			 :title="device.name || '-'"
				:sub-title="device.id" :extra="device.online?'在线':'离线'" thumbnail="/static/device.png"
				:style="{backgroundColor: (device.online ? '': '#f6f6f6')}">
				<device-values :product="device.product_id" :device="device.id" type="simple"></device-values>
			</uni-card>
		</view>

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
				total: 0,
				online: 0,
				offline: 0,

				pageSize: 10,

				keyword: '',

				devices: [],

				loading: false,

				last_group_id: undefined
			}
		},
		computed: {
			...mapState(userStore, ['user', 'group']),
		},
		onLoad() {
			//this.loadDeviceData();
			this.load().then()
		},
		onShow() {

			//有变化重新加载
			if (this.last_group_id != this.group.id) {
				this.loadStats().then()
				this.refresh().then()
				this.last_group_id = this.group.id
			}
		},
		onPullDownRefresh() {
			this.keyword = ''
			this.refresh().finally(() => {
				uni.stopPullDownRefresh();
			});
		},
		onReachBottom() {
			console.log("到达底部")
			// TODO: 加载更多功能
			this.loadDevices()
		},
		methods: {
			//统一加载
			async load() {
				//先加载
				if (this.group) {
					this.loadStats().then()
					this.loadDevices().then()
					this.last_group_id = this.group.id
				}

				//有变化重新加载
				user.checkGroup().then(change => {
					if (change) {
						this.loadStats().then()
						this.refresh().then()
						this.last_group_id = this.group.id
					}
				})
			},

			//统计信息
			async loadStats() {
				let res = await post("table/device/count", {
					filter: {
						group_id: this.group.id
					}
				})
				this.total = res.data
				res = await post("table/device/count", {
					filter: {
						group_id: this.group.id,
						online: 1,
					}
				})
				this.online = res.data
				this.offline = this.total - this.online
			},
			//加载设备
			async loadDevices() {
				let res = await post("table/device/search", {
					filter: {
						group_id: this.group.id
					},
					keyword: this.keyword,
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
			
			
			openGroup() {
				uni.navigateTo({
					url: "/pages/mine/group"
				})
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
			// 打开设备详情
			open(device) {
				console.log('打开设备详情:', device);
				uni.navigateTo({
					url: "/pages/device/detail?id=" + device.id,
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.organization-info {
		padding: 20rpx;
		background: #f0f8ff;
		border-bottom: 1rpx solid #e0e0e0;

		.org-name {
			display: block;
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 10rpx;
		}

		.org-role {
			font-size: 28rpx;
			color: #666;
		}
	}

	.no-organization {
		padding: 20rpx;
	}

	.item {
		color: #808080;
		text-align: center;

		.label {
			font-size: 28rpx;
		}

		.num {
			color: #1296db;
			font-size: 1.5em;
			font-weight: bold;
			padding: 15rpx 0;
		}
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