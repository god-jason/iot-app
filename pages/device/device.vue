<template>
	<view>
		<!-- 组织信息显示 -->
		<view v-if="currentMember" class="organization-info">
			<text class="org-name">当前组织: {{ currentMember.group_name || '未知组织' }}</text>
			<text class="org-role">角色: {{ currentMember.role || 'user' }}</text>
		</view>
		
		<view v-else class="no-organization">
			<uni-notice-bar show-icon text="您还没有加入任何组织，请联系管理员将您添加到组织中"></uni-notice-bar>
		</view>

		<uni-search-bar placeholder="搜索设备" @confirm="search" v-model="searchKeyword"></uni-search-bar>

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
			<uni-card v-for="(device, index) in filteredDevices" :key="device.id" @click="open(device)" 
				:title="device.name" :sub-title="device.id"
				:extra="getDeviceStatus(device)" thumbnail="/static/device.png"
				:style="{backgroundColor: (device.online ? '': '#f6f6f6')}">
				<view class="device-info">
					<text class="info-item">产品ID: {{ device.product_id || '未知' }}</text>
					<text class="info-item">厂商: {{ device.company || '未知' }}</text>
					<text class="info-item">地址: {{ device.address || '未知' }}</text>
					<text class="info-item">创建时间: {{ formatDate(device.created) }}</text>
				</view>
				<!-- 如果需要显示设备属性值，可以取消注释 -->
				<!-- <device-values @property-click="onPropertyClick(device, $event)" :device="device.id"
					:product="device.product_id" type="list"></device-values> -->
			</uni-card>
		</view>

		<!-- 没有设备的情况 -->
		<view v-else-if="!loading" class="empty-state">
			<view class="empty-content">
				<uni-icons type="device" size="80" color="#ccc"></uni-icons>
				<text class="empty-text">暂无设备</text>
				<text class="empty-desc">该组织下暂无设备或设备数据加载失败</text>
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
		getGroupDevices,
		getDefaultGroupDevices
	} from '@/utils/request.js';

	export default {
		data() {
			return {
				total: 0,
				online: 0,
				offline: 0,
				searchKeyword: '',
				devices: [],
				loading: false,
				currentMember: null,
				currentGroupId: null
			}
		},
		computed: {
			// 过滤设备列表
			filteredDevices() {
				if (!this.searchKeyword) {
					return this.devices;
				}
				return this.devices.filter(device => 
					device.name?.includes(this.searchKeyword) || 
					device.id?.includes(this.searchKeyword) ||
					device.product_id?.includes(this.searchKeyword)
				);
			}
		},
		onLoad() {
			this.loadDeviceData();
		},
		onShow() {
			// 页面显示时刷新数据
			this.refreshDeviceData();
		},
		onPullDownRefresh() {
			this.refreshDeviceData().finally(() => {
				uni.stopPullDownRefresh();
			});
		},
		onReachBottom() {
			console.log("到达底部")
			// TODO: 加载更多功能
		},
		methods: {
			// 加载设备数据
			async loadDeviceData() {
				// 从本地存储获取数据
				this.currentMember = uni.getStorageSync('currentMember');
				this.currentGroupId = uni.getStorageSync('currentGroupId');
				const cachedDevices = uni.getStorageSync('groupDevices');
				
				console.log('当前成员:', this.currentMember);
				console.log('当前组织ID:', this.currentGroupId);
				console.log('缓存设备:', cachedDevices);
				
				if (cachedDevices && cachedDevices.length > 0) {
					this.devices = cachedDevices;
					this.calculateStats();
				} else {
					// 如果没有缓存数据，从API加载
					await this.refreshDeviceData();
				}
			},

			// 刷新设备数据
			async refreshDeviceData() {
				this.loading = true;
				try {
					let devices = [];
					
					if (this.currentGroupId) {
						// 有具体组织ID，获取该组织的设备
						console.log('获取组织设备，组织ID:', this.currentGroupId);
						devices = await getGroupDevices(this.currentGroupId);
					} else {
						// 没有具体组织ID，获取默认组织的设备
						console.log('获取默认组织设备');
						devices = await getDefaultGroupDevices();
					}
					
					console.log('API返回的设备数据:', devices);
					
					// 处理响应格式
					if (devices && devices.data) {
						this.devices = devices.data;
					} else if (Array.isArray(devices)) {
						this.devices = devices;
					} else {
						console.warn('设备数据格式异常:', devices);
						this.devices = [];
					}
					
					// 保存到本地存储
					uni.setStorageSync('groupDevices', this.devices);
					
					// 计算统计信息
					this.calculateStats();
					
				} catch (error) {
					console.error('加载设备数据失败:', error);
					uni.showToast({
						title: '加载设备失败',
						icon: 'none'
					});
					this.devices = [];
				} finally {
					this.loading = false;
				}
			},

			// 计算设备统计信息
			calculateStats() {
				this.total = this.devices.length;
				this.online = this.devices.filter(device => device.online).length;
				this.offline = this.total - this.online;
			},

			// 获取设备状态
			getDeviceStatus(device) {
				return device.online ? '在线' : '离线';
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

			// 搜索
			search() {
				console.log('搜索关键词:', this.searchKeyword);
				// 计算过滤后的统计信息
				const filtered = this.filteredDevices;
				this.total = filtered.length;
				this.online = filtered.filter(device => device.online).length;
				this.offline = this.total - this.online;
			},

			// 打开设备详情
			open(device) {
				console.log('打开设备详情:', device);
				uni.navigateTo({
					url: "/pages/device/detail?id=" + device.id,
				})
			},

			onPropertyClick(device, property) {
				console.log('设备属性点击:', device, property);
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