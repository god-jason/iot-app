<template>
	<view class="page">
		<!-- 组织信息显示 -->
		<view v-if="group" class="organization-info">
			<view class="org" @click="openGroup">
				<uni-icons type="staff" color="white" size="22" @click="searchable = !searchable"></uni-icons>
				<text class="org-name">{{ group.name || '组织' }}</text>
			</view>
			<uni-icons type="search" color="white" size="22" @click="searchable = !searchable"></uni-icons>
		</view>

		<view v-else class="no-organization" @click="openGroup">
			<uni-notice-bar show-icon text="您还没有加入任何组织，请联系管理员将您添加到组织中"></uni-notice-bar>
		</view>

		<uni-search-bar v-if="group && searchable" placeholder="搜索设备" @confirm="search"
			@cancel="cancelSearch"></uni-search-bar>

		<uni-grid v-if="group" :column="4" :show-border="false" :square="false">
			<uni-grid-item>
				<view class="item" @click="filterAll">
					<view class="label">总数</view>
					<view class="num"> {{total}} </view>
				</view>
			</uni-grid-item>
			<uni-grid-item>
				<view class="item" @click="filterOnline">
					<view class="label">在线</view>
					<view class="num"> {{online}} </view>
				</view>
			</uni-grid-item>
			<uni-grid-item>
				<view class="item" @click="filterOffline">
					<view class="label">离线</view>
					<view class="num"> {{offline}} </view>
				</view>
			</uni-grid-item>
			<uni-grid-item>
				<view class="item" @click="filterError">
					<view class="label">故障</view>
					<view class="num" :class="{red: error}"> {{error || '-'}} </view>
				</view>
			</uni-grid-item>
		</uni-grid>

		<!-- 		<uni-section title="设备列表" type="square" class="section">
		</uni-section> -->

		<!-- 有设备的情况 -->
		<view v-if="devices.length > 0">
			<view v-for="(device, index) in devices" :key="device.id" @click="open(device)" :title="device.name || '-'"
				:sub-title="device.id" :extra="device.online?'在线':'离线'" thumbnail="/static/device.png"
				class="device-card" :class="{online: device.online,
				 offline: !device.online, error: device.error}">

				<view class="title">
					<view class="name">
						{{device.name || device.id}}
					</view>
					<view class="status">
						{{device.online?'在线':'离线'}}
					</view>
				</view>

				<device-values-mini v-if="device.online" :product="device.product_id" :device="device.id"
					type="simple"></device-values-mini>
					
				<view class="error_string" v-if="device.error_string && device.error">
					错误：{{device.error_string || device.error}}
				</view>
			</view>
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

		<uni-fab v-if="group" :pattern="{icon: 'scan', buttonColor:'#00000088'}" horizontal="right" @fabClick="scanDevice"></uni-fab>
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
				searchable: false,

				total: 0,
				online: 0,
				offline: 0,
				error: 0,

				pageSize: 10,

				keyword: '',

				devices: [],
				
				filter: {},

				loading: false,

				last_group_id: undefined,
				_onDeviceChanged: null
			}
		},
		onShareAppMessage() {
			return {title: "邀请您使用龙源小管家", imageUrl:"/static/logo.jpg"}
		},
		computed: {
			...mapState(userStore, ['user', 'group']),
		},
		onLoad() {
			//this.loadDeviceData();
			this.load().then()

			// 监听设备绑定/解绑/更新事件：用于从其他页面返回或扫码绑定后刷新列表
			this._onDeviceChanged = () => {
				if (this.group && this.group.id) {
					this.loadStats().then()
					this.refresh().then()
				}
			}
			uni.$on('device-bound', this._onDeviceChanged)
			uni.$on('device-unbound', this._onDeviceChanged)
			uni.$on('device-updated', this._onDeviceChanged)
		},
		onUnload() {
			if (this._onDeviceChanged) {
				uni.$off('device-bound', this._onDeviceChanged)
				uni.$off('device-unbound', this._onDeviceChanged)
				uni.$off('device-updated', this._onDeviceChanged)
				this._onDeviceChanged = null
			}
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
		onReachBottom() {
			console.log("到达底部")
			this.loadDevices()
		},
		methods: {
			filterAll() {
				this.filter = {}
				this.refresh().then()
			},
			filterOnline() {
				this.filter = {online: 1}
				this.refresh()
			},
			filterOffline() {
				this.filter = {online: 0}
				this.refresh()
			},
			filterError(){
				this.filter = {error: 1}
				this.refresh()
			},
			//统一加载
			async load() {
				//先加载（仅在有组织时加载）
				if (this.group && this.group.id) {
					this.loadStats().then()
					this.loadDevices().then()
					this.last_group_id = this.group.id
				}

				//有变化重新加载
				user.checkGroup().then(change => {
					if (change && this.group && this.group.id) {
						this.loadStats().then()
						this.refresh().then()
						this.last_group_id = this.group.id
					}
				})
			},

			//统计信息
			async loadStats() {
				if (!this.group || !this.group.id) {
					return
				}
				let res = await post("table/device/count", {
					filter: {
						group_id: this.group.id
					}
				})
				this.total = res.data || 0
				
				res = await post("table/device/count", {
					filter: {
						group_id: this.group.id,
						online: 1,
					}
				})
				this.online = res.data || 0
				
				res = await post("table/device/count", {
					filter: {
						group_id: this.group.id,
						online: 0,
					}
				})
				this.offline = res.data || 0
				
				res = await post("table/device/count", {
					filter: {
						group_id: this.group.id,
						error: 1,
					}
				})
				this.error = res.data || 0
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
				
				// 加载状态过滤条件
				Object.assign(filter, this.filter)
				
				let res = await post("table/device/search", {
					filter: filter,
					skip: this.devices.length,
					limit: this.pageSize,
					sort: {
						name: 1
					}
				})

				if (res.data && res.data.length > 0) {
					this.devices = this.devices.concat(res.data)
					//this.total = res.total
				}

				if (!res.data || !res.data.length || res.data.length < this.pageSize) {
					//没有了
				}
			},
			async refresh() {
				this.devices = []
				this.loadStats()
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
			},

			scanDevice() {
				uni.scanCode({
					success: (res) => {
						console.log('扫描结果:', res);

						let deviceId = '';

						// 处理扫描结果
						if (res.result) {
							// 尝试从结果中提取SN号
							const result = res.result.trim();

							// 如果是URL，尝试提取参数
							if (result.startsWith('http')) {
								const url = new URL(result);
								deviceId = url.searchParams.get('sn') ||
									url.searchParams.get('device_id') ||
									result;
							} else {
								// 直接使用结果
								deviceId = result;
							}

							// 移除可能的空白字符
							deviceId = deviceId.replace(/\s/g, '');

							// 扫描后自动获取设备信息
							this.bindDevice(deviceId);
						}
					}
				});
			},

			// 绑定设备
			async bindDevice(deviceId) {
				let groupId = this.group.id
				try {
					let res = await get(`device/${deviceId}/bind/${groupId}`);

					uni.showToast({
						title: '绑定成功',
						icon: 'success'
					});
				} catch (err) {
					console.error(err)
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
	.organization-info {
		padding: 20rpx;
		//background: #f0f8ff;
		color: white;
		//background-color: transparent;
		background-color: #474747;
		//border-bottom: 1rpx solid #e0e0e0;
		//text-align: center;

		.icon {
			color: white;
			font-size: 2em;
		}

		display: flex;

		.org {
			flex: 1;
			display: flex;
			color: white
		}

		.org-name {
			display: block;
			font-size: 32rpx;
			font-weight: bold;
			//color: #333;
			margin-bottom: 10rpx;
		}

		.org-role {
			font-size: 28rpx;
			//color: #666;
		}
	}

	.no-organization {
		padding: 20rpx;
	}

	.item {
		padding: 10rpx 0;
		//color: #808080;
		text-align: center;

		.label {
			font-size: 18px;
		}

		.num {
			//color: #1296db;
			font-size: 28px;
			font-weight: bold;
			padding: 15rpx 0;

			&.red {
				color: red;
			}
		}
	}

	.section {
		background-color: transparent;
		color: white;
	}

	.device-card {
		//color: grey;
		background-color: #2a2a2a;
		color: white;
		margin: 20rpx 0;
		padding: 10rpx 20rpx;
		
		
		box-shadow: 1px 1px 5px #000;

		.title {
			padding: 15rpx;
			display: flex;
			//background-color: #666;

			.name {
				flex: 1;
				font-weight: bold;
				font-size: 1.2em;
			}

			.online {}
		}
		
		.error_string {
			//color: red;
			font-size: 1.3em;
			font-weight: bold;
		}
	}

	.online {
		//background-color: #f2f9ff;
	}

	.offline {
		background-color: #666;
		color: #ccc;
	}

	.error {
		//background-color: #ff6060;
		background-color: red;
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