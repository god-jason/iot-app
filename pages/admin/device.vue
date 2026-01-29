<template>
	<view class="page">
		<!-- 搜索框 -->
		<uni-search-bar
			:placeholder="searchPlaceholder" 
			v-model="searchKeyword"
			@confirm="handleSearch"
			@clear="handleClear"
			@cancel="handleCancel">
		</uni-search-bar>
		
		<!-- 设备列表 -->
		<view v-if="devices.length > 0">
			<uni-list>
				<uni-list-item 
					v-for="(device, index) in devices" 
					:key="device.id" 
					:title="device.name || '-'" 
					:note="device.id"
					:rightText="device.online ? '在线' : '离线'"
					clickable 
					@click="openDevice(device)">
				</uni-list-item>
			</uni-list>
		</view>
		
		<!-- 空状态 -->
		<view v-else-if="!loading" class="empty-state">
			<uni-icons type="device" size="80" color="#ccc"></uni-icons>
			<text class="empty-text">{{ searchKeyword ? '未找到相关设备' : '暂无设备' }}</text>
			<text class="empty-tip" v-if="!searchKeyword">请添加或绑定设备</text>
		</view>
		
		<!-- 加载状态 -->
		<view v-if="loading" class="loading-state">
			<uni-load-more :status="loadMoreStatus" :content-text="loadMoreText"></uni-load-more>
		</view>
		
		<!-- 加载更多提示 -->
		<view v-if="hasMore && !loading && devices.length > 0" class="load-more-hint">
			<text>上拉加载更多</text>
		</view>
	</view>
</template>

<script>
	import {
		post
	} from '../../utils/request';

	export default {
		data() {
			return {
				// 搜索相关
				searchKeyword: '',
				searchPlaceholder: '搜索设备名称或ID',
				
				// 设备数据
				devices: [],
				
				// 分页相关
				pageSize: 20,
				currentPage: 0,
				totalCount: 0,
				hasMore: true,
				
				// 加载状态
				loading: false,
				loadingMore: false,
				searching: false,
				
				// 加载更多状态
				loadMoreStatus: 'loading',
				loadMoreText: {
					contentdown: '上拉显示更多',
					contentrefresh: '正在加载...',
					contentnomore: '没有更多设备了'
				}
			}
		},
		onLoad() {
			// 初始加载
			this.loadDevices(true);
		},
		onPullDownRefresh() {
			// 下拉刷新
			this.refresh();
		},
		onReachBottom() {
			// 上拉加载更多
			if (this.hasMore && !this.loading) {
				this.loadMore();
			}
		},
		methods: {
			// 构建搜索参数（修正版本）
			buildSearchParams(isRefresh = false) {
				const skip = isRefresh ? 0 : this.devices.length;
				
				// 基础过滤条件 - 按你的实际数据结构调整
				const filter = {
				};
				
				// 添加搜索关键词过滤 - 使用简单条件				
				if (this.searchKeyword) {					
					//  like 操作符或直接字符串匹配
					filter.$or = {
						id: "%"+this.searchKeyword+"%",
						name: "%"+this.searchKeyword+"%",
					}
				}
				
				return {
					filter: filter,
					skip: skip,
					limit: this.pageSize,
					//sort: { created: -1 }, // 按创建时间倒序
					columns: ['id', 'name', 'online', 'product_id', 'location', 'update_time', 'create_time']
				};
			},
			
			// 加载设备列表
			async loadDevices(isRefresh = false) {
				if (this.loading) return;
				
				this.loading = true;
				if (isRefresh) {
					this.currentPage = 0;
					this.devices = [];
					this.hasMore = true;
				}
				
				try {
					const params = this.buildSearchParams(isRefresh);
					console.log('搜索参数（简化）:', params);
					
					let res = await post('table/device/search', params);
					console.log('接口响应:', res);
					
					if (res && res.data) {
						this.devices = res.data || [];
						const total = res.total || 0;
						
						this.totalCount = total;
						this.hasMore = this.devices.length < total;
						
						// 如果前端过滤后数据变少，重新计算 hasMore
						if (this.searchKeyword && newDevices.length < this.pageSize) {
							this.hasMore = false;
						}
						
						// 更新加载状态
						this.loadMoreStatus = this.hasMore ? 'more' : 'noMore';
						
						// 如果是搜索，显示结果提示
						if (this.searchKeyword && isRefresh) {
							uni.showToast({
								title: `找到${newDevices.length}个设备`,
								icon: 'none',
								duration: 1500
							});
						}
					}
				} catch (error) {
					console.error('加载设备失败:', error);
					
					uni.showToast({
						title: '加载失败，请重试',
						icon: 'error'
					});
				} finally {
					this.loading = false;
					uni.stopPullDownRefresh();
				}
			},
						
			// 搜索处理
			handleSearch() {
				if (this.searching) return;
				
				this.searching = true;
				console.log('执行搜索，关键词:', this.searchKeyword);
				
				// 防抖处理
				clearTimeout(this.searchTimer);
				this.searchTimer = setTimeout(() => {
					this.loadDevices(true);
					this.searching = false;
				}, 500);
			},
			
			// 清除搜索
			handleClear() {
				this.searchKeyword = '';
				this.loadDevices(true);
			},
			
			// 取消搜索
			handleCancel() {
				this.searchKeyword = '';
				this.loadDevices(true);
			},
			
			// 刷新数据
			async refresh() {
				await this.loadDevices(true);
			},
			
			// 加载更多
			async loadMore() {
				if (!this.hasMore || this.loading) return;
				
				this.loading = true;
				this.loadMoreStatus = 'loading';
				
				try {
					const params = this.buildSearchParamsAlternative(false);
					let res = await post('table/device/search', params);
					
					if (res && res.data) {
						let newDevices = res.data || [];
						
						this.devices = [...this.devices, ...newDevices];
						this.hasMore = newDevices.length === this.pageSize;
						this.loadMoreStatus = this.hasMore ? 'more' : 'noMore';
					}
				} catch (error) {
					console.error('加载更多失败:', error);
				} finally {
					this.loading = false;
				}
			},
			
			// 打开设备详情
			openDevice(device) {
				console.log('打开设备详情:', device);
				uni.navigateTo({
					url: '/pages/device/detail?id=' + device.id
				});
			},			
			
		}
	}
</script>

<style lang="scss">
	.device-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 10rpx;
		
		.device-id {
			font-size: 24rpx;
			color: #999;
		}
		
		.device-time {
			font-size: 24rpx;
			color: #999;
		}
	}
	
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;
		
		.empty-text {
			font-size: 32rpx;
			color: #999;
			margin-top: 30rpx;
		}
		
		.empty-tip {
			font-size: 28rpx;
			color: #ccc;
			margin-top: 20rpx;
		}
	}
	
	.loading-state {
		padding: 40rpx 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	.load-more-hint {
		padding: 30rpx 0;
		text-align: center;
		font-size: 28rpx;
		color: #999;
		
		text {
			animation: pulse 2s infinite;
		}
	}
	
	@keyframes pulse {
		0%, 100% { opacity: 0.6; }
		50% { opacity: 1; }
	}
</style>