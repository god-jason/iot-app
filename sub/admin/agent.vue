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
		
		<!-- 经销商列表 -->
		<view v-if="agents.length > 0">
			<uni-list>
				<uni-list-item 
					v-for="(agent, index) in agents" 
					:key="agent.id" 
					:title="agent.name || '-'" 
					:note="agent.id"
					clickable 
					@click="openAgent(agent)">
				</uni-list-item>
			</uni-list>
		</view>
		
		<!-- 空状态 -->
		<view v-else-if="!loading" class="empty-state">
			<uni-icons type="shop" size="80" color="#ccc"></uni-icons>
			<text class="empty-text">{{ searchKeyword ? '未找到相关经销商' : '暂无经销商' }}</text>
			<text class="empty-tip" v-if="!searchKeyword">暂无数据</text>
		</view>
		
		<!-- 加载状态 -->
		<view v-if="loading" class="loading-state">
			<uni-load-more :status="loadMoreStatus" :content-text="loadMoreText"></uni-load-more>
		</view>
		
		<!-- 加载更多提示 -->
		<view v-if="hasMore && !loading && agents.length > 0" class="load-more-hint">
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
				searchPlaceholder: '搜索经销商名称或ID',
				
				// 经销商数据
				agents: [],
				
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
					contentnomore: '没有更多数据了'
				}
			}
		},
		onLoad() {
			// 初始加载
			this.loadAgents(true);
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
				const skip = isRefresh ? 0 : this.agents.length;
				
				// 基础过滤条件
				const filter = {};
				
				// 添加搜索关键词过滤
				if (this.searchKeyword) {
					filter.$or = {
						id: "%" + this.searchKeyword + "%",
						name: "%" + this.searchKeyword + "%",
					}
				}
				
				return {
					filter: filter,
					skip: skip,
					limit: this.pageSize
				};
			},
			
			// 加载经销商列表
			async loadAgents(isRefresh = false) {
				if (this.loading) return;
				
				this.loading = true;
				if (isRefresh) {
					this.currentPage = 0;
					this.agents = [];
					this.hasMore = true;
				}
				
				try {
					const params = this.buildSearchParams(isRefresh);
					
					let res = await post('table/agent/search', params);
					
					if (res && res.data) {
						const newAgents = res.data || [];
						
						if (isRefresh) {
							this.agents = newAgents;
						} else {
							this.agents = [...this.agents, ...newAgents];
						}
						
						const total = res.total || 0;
						this.totalCount = total;
						this.hasMore = this.agents.length < total;
						
						// 更新加载状态
						this.loadMoreStatus = this.hasMore ? 'more' : 'noMore';
						
						// 如果是搜索，显示结果提示
						if (this.searchKeyword && isRefresh && newAgents.length > 0) {
							uni.showToast({
								title: `找到${newAgents.length}个经销商`,
								icon: 'none',
								duration: 1500
							});
						}
					}
				} catch (error) {
					console.error('加载经销商失败:', error);
					
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
				
				// 防抖处理
				clearTimeout(this.searchTimer);
				this.searchTimer = setTimeout(() => {
					this.loadAgents(true);
					this.searching = false;
				}, 500);
			},
			
			// 清除搜索
			handleClear() {
				this.searchKeyword = '';
				this.loadAgents(true);
			},
			
			// 取消搜索
			handleCancel() {
				this.searchKeyword = '';
				this.loadAgents(true);
			},
			
			// 刷新数据
			async refresh() {
				await this.loadAgents(true);
			},
			
			// 加载更多
			async loadMore() {
				if (!this.hasMore || this.loading) return;
				
				this.loading = true;
				this.loadMoreStatus = 'loading';
				
				try {
					const params = this.buildSearchParams(false);
					let res = await post('table/agent/search', params);
					
					if (res && res.data) {
						let newAgents = res.data || [];
						
						this.agents = [...this.agents, ...newAgents];
						this.hasMore = newAgents.length === this.pageSize;
						this.loadMoreStatus = this.hasMore ? 'more' : 'noMore';
					}
				} catch (error) {
					console.error('加载更多失败:', error);
				} finally {
					this.loading = false;
				}
			},
			
			// 打开经销商详情（预留，目前暂无详情页）
			openAgent(agent) {
				console.log('打开经销商详情:', agent);
				// 可以后续添加详情页面
				// uni.navigateTo({
				// 	url: '/admin/agent_detail?id=' + agent.id
				// });
			},			
			
		}
	}
</script>

<style lang="scss">
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



