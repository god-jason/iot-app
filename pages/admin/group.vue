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
		
		<!-- 组织列表 -->
		<view v-if="groups.length > 0">
			<uni-list>
				<uni-list-item 
					v-for="(group, index) in groups" 
					:key="group.id" 
					:title="group.name || '未命名组织'"
					:note="formatGroupNote(group)"
					:rightText="formatStatus(group)"
					:rightTextStyle="getStatusStyle(group)"
					clickable 
					@click="openGroup(group)">
					
					<template v-slot:footer>
						<view class="group-footer">
							<text class="group-id">ID: {{ group.id }}</text>
							<text class="group-time" v-if="group.created">
								创建时间: {{ formatTime(group.created) }}
							</text>
						</view>
					</template>
				</uni-list-item>
			</uni-list>
		</view>
		
		<!-- 空状态 -->
		<view v-else-if="!loading" class="empty-state">
			<uni-icons type="contact" size="80" color="#ccc"></uni-icons>
			<text class="empty-text">{{ searchKeyword ? '未找到相关组织' : '暂无组织' }}</text>
			<text class="empty-tip" v-if="!searchKeyword">请创建或加入组织</text>
		</view>
		
		<!-- 加载状态 -->
		<view v-if="loading" class="loading-state">
			<uni-load-more :status="loadMoreStatus" :content-text="loadMoreText"></uni-load-more>
		</view>
		
		<!-- 加载更多提示 -->
		<view v-if="hasMore && !loading && groups.length > 0" class="load-more-hint">
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
				searchPlaceholder: '搜索组织名称',
				
				// 组织数据
				groups: [],
				
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
					contentnomore: '没有更多组织了'
				}
			}
		},
		onLoad() {
			// 初始加载
			this.loadGroups(true);
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
			// 构建搜索参数
			buildSearchParams(isRefresh = false) {
				const skip = isRefresh ? 0 : this.groups.length;
				
				// 基础过滤条件
				const filter = {};
				
				// 添加搜索关键词过滤
				if (this.searchKeyword.trim()) {
					filter['name'] = this.searchKeyword;
				}
				
				return {
					filter: filter,
					skip: skip,
					limit: this.pageSize,
					sort: { created: -1 }, // 按创建时间倒序
					columns: ['id', 'name', 'disabled', 'created', 'user_id']
				};
			},
			
			// 加载组织列表
			async loadGroups(isRefresh = false) {
				if (this.loading) return;
				
				this.loading = true;
				if (isRefresh) {
					this.currentPage = 0;
					this.groups = [];
					this.hasMore = true;
				}
				
				try {
					const params = this.buildSearchParams(isRefresh);
					console.log('组织搜索参数:', params);
					
					let res = await post('table/group/search', params);
					console.log('组织接口响应:', res);
					
					if (res && res.data) {
						let newGroups = res.data || [];
						const total = res.total || 0;
						
						// 如果有搜索关键词，在前端进行过滤
						if (this.searchKeyword.trim() && newGroups.length > 0) {
							const keyword = this.searchKeyword.toLowerCase();
							newGroups = newGroups.filter(group => {
								return (group.name && group.name.toLowerCase().includes(keyword));
							});
						}
						
						if (isRefresh) {
							this.groups = newGroups;
						} else {
							this.groups = [...this.groups, ...newGroups];
						}
						
						this.totalCount = total;
						this.hasMore = this.groups.length < total;
						
						// 如果前端过滤后数据变少，重新计算 hasMore
						if (this.searchKeyword && newGroups.length < this.pageSize) {
							this.hasMore = false;
						}
						
						// 更新加载状态
						this.loadMoreStatus = this.hasMore ? 'more' : 'noMore';
						
						// 如果是搜索，显示结果提示
						if (this.searchKeyword && isRefresh) {
							uni.showToast({
								title: `找到${newGroups.length}个组织`,
								icon: 'none',
								duration: 1500
							});
						}
						
						console.log('加载的组织数据:', newGroups);
					}
				} catch (error) {
					console.error('加载组织失败:', error);
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
				console.log('执行组织搜索，关键词:', this.searchKeyword);
				
				// 防抖处理
				clearTimeout(this.searchTimer);
				this.searchTimer = setTimeout(() => {
					this.loadGroups(true);
					this.searching = false;
				}, 500);
			},
			
			// 清除搜索
			handleClear() {
				this.searchKeyword = '';
				this.loadGroups(true);
			},
			
			// 取消搜索
			handleCancel() {
				this.searchKeyword = '';
				this.loadGroups(true);
			},
			
			// 刷新数据
			async refresh() {
				await this.loadGroups(true);
			},
			
			// 加载更多
			async loadMore() {
				if (!this.hasMore || this.loading) return;
				
				this.loading = true;
				this.loadMoreStatus = 'loading';
				
				try {
					const params = this.buildSearchParams(false);
					let res = await post('table/group/search', params);
					
					if (res && res.data) {
						let newGroups = res.data || [];
						
						// 前端过滤搜索关键词
						if (this.searchKeyword.trim()) {
							const keyword = this.searchKeyword.toLowerCase();
							newGroups = newGroups.filter(group => {
								return (group.name && group.name.toLowerCase().includes(keyword));
							});
						}
						
						this.groups = [...this.groups, ...newGroups];
						this.hasMore = newGroups.length === this.pageSize;
						this.loadMoreStatus = this.hasMore ? 'more' : 'noMore';
					}
				} catch (error) {
					console.error('加载更多失败:', error);
				} finally {
					this.loading = false;
				}
			},
			
			// 打开组织详情
			openGroup(group) {
				console.log('打开组织详情:', group);
				uni.navigateTo({
					url: '/pages/admin/group_detail?id=' + group.id
				});
			},
			
			// 格式化组织备注
			formatGroupNote(group) {
				return '';
			},
			
			// 格式化状态
			formatStatus(group) {
				if (group.disabled === 1 || group.disabled === true) {
					return '已禁用';
				}
				return '正常';
			},
			
			// 获取状态样式
			getStatusStyle(group) {
				if (group.disabled === 1 || group.disabled === true) {
					return {
						color: '#ff3b30',
						fontSize: '28rpx'
					};
				}
				return {
					color: '#4cd964',
					fontSize: '28rpx'
				};
			},
			
			// 格式化时间
			formatTime(timestamp) {
				if (!timestamp) return '';
				
				try {
					// 假设 created 是时间戳或日期字符串
					const date = new Date(timestamp);
					
					// 如果是无效日期
					if (isNaN(date.getTime())) {
						// 尝试将 created 当作时间戳
						const timestampNum = parseInt(timestamp);
						if (!isNaN(timestampNum)) {
							const dateFromTimestamp = new Date(timestampNum);
							if (!isNaN(dateFromTimestamp.getTime())) {
								return dateFromTimestamp.toLocaleDateString('zh-CN');
							}
						}
						return timestamp; // 直接返回原始值
					}
					
					const now = new Date();
					
					// 如果是今天
					if (date.toDateString() === now.toDateString()) {
						return date.toLocaleTimeString('zh-CN', { 
							hour: '2-digit', 
							minute: '2-digit' 
						});
					}
					
					// 如果是昨天
					const yesterday = new Date(now);
					yesterday.setDate(yesterday.getDate() - 1);
					if (date.toDateString() === yesterday.toDateString()) {
						return '昨天 ' + date.toLocaleTimeString('zh-CN', { 
							hour: '2-digit', 
							minute: '2-digit' 
						});
					}
					
					// 一周内
					const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
					if (diffDays < 7) {
						const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
						return days[date.getDay()] + ' ' + date.toLocaleTimeString('zh-CN', { 
							hour: '2-digit', 
							minute: '2-digit' 
						});
					}
					
					// 更早的时间
					return date.toLocaleDateString('zh-CN');
					
				} catch (e) {
					console.error('格式化时间失败:', e, '原始值:', timestamp);
					return timestamp;
				}
			}
		}
	}
</script>

<style lang="scss">
	.group-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 10rpx;
		
		.group-id {
			font-size: 24rpx;
			color: #999;
		}
		
		.group-time {
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