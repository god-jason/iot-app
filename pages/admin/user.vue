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
		
		<!-- 用户列表 -->
		<view v-if="users.length > 0">
			<uni-list>
				<uni-list-chat 
					v-for="(user, index) in users" 
					:key="user.id"
					:title="user.name"
					:note="user.id"
					:avatar="user.avatar || '/static/avatar.jpg'"
					:avatar-circle="true"
					time=""
					clickable 
					@click="openUserDetail(user)">
				</uni-list-chat>
			</uni-list>
		</view>
		
		<!-- 空状态 -->
		<view v-else-if="!loading" class="empty-state">
			<uni-icons type="contact" size="80" color="#ccc"></uni-icons>
			<text class="empty-text">{{ searchKeyword ? '未找到相关用户' : '暂无用户' }}</text>
			<text class="empty-tip" v-if="!searchKeyword">暂无用户数据</text>
		</view>
		
		<!-- 加载状态 -->
		<view v-if="loading" class="loading-state">
			<uni-load-more :status="loadMoreStatus" :content-text="loadMoreText"></uni-load-more>
		</view>
		
		<!-- 加载更多提示 -->
		<view v-if="hasMore && !loading && users.length > 0" class="load-more-hint">
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
				searchPlaceholder: '搜索用户名称',
				
				// 用户数据
				users: [],
				
				// 分页相关
				pageSize: 20,
				totalCount: 0,
				hasMore: true,
				
				// 加载状态
				loading: false,
				searching: false,
				
				// 加载更多状态
				loadMoreStatus: 'loading',
				loadMoreText: {
					contentdown: '上拉显示更多',
					contentrefresh: '正在加载...',
					contentnomore: '没有更多用户了'
				},
			}
		},
		onLoad() {
			// 初始加载
			this.loadUsers(true);
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
			async buildSearchParams(isRefresh = false) {
				const skip = isRefresh ? 0 : this.users.length;
								
				// 基础过滤条件
				const filter = {};
				
				// 添加搜索关键词过滤
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
					sort: {created: -1}
				};
			},
			
			// 加载用户列表
			async loadUsers(isRefresh = false) {
				if (this.loading) return;
				
				this.loading = true;
				if (isRefresh) {
					this.users = [];
					this.hasMore = true;
					this.loadMoreStatus = 'loading';
				}
				
				try {
					const params = await this.buildSearchParams(isRefresh);
					console.log('用户搜索参数:', params);
					
					let res = await post(`table/user/search`, params);
					console.log('用户接口响应:', res);
					
					if (res && res.data) {
						this.handleSuccessResponse(res.data, res.total, isRefresh);
					}
				} catch (error) {
					console.error('加载用户失败:', error);
					
					// 尝试简化查询
						uni.showToast({
							title: '加载失败，请重试',
							icon: 'error'
						});
				} finally {
					this.loading = false;
					uni.stopPullDownRefresh();
				}
			},
			
			
			// 处理成功响应
			handleSuccessResponse(newUsers, total, isRefresh) {
				
				if (isRefresh) {
					this.users = newUsers;
				} else {
					this.users = [...this.users, ...newUsers];
				}
				
				this.totalCount = total || 0;
				this.hasMore = this.users.length < this.totalCount;
				
				// 如果前端过滤后数据变少，重新计算 hasMore
				if (this.searchKeyword && newUsers.length < this.pageSize) {
					this.hasMore = false;
				}
				
				// 更新加载状态
				this.loadMoreStatus = this.hasMore ? 'more' : 'noMore';
				
				// 搜索提示
				if (this.searchKeyword && isRefresh) {
					uni.showToast({
						title: `找到${newUsers.length}个用户`,
						icon: 'none',
						duration: 1500
					});
				}
			},
						
			// 搜索处理
			handleSearch() {
				if (this.searching) return;
				
				this.searching = true;
				console.log('执行用户搜索，关键词:', this.searchKeyword);
				
				// 防抖处理
				clearTimeout(this.searchTimer);
				this.searchTimer = setTimeout(() => {
					this.loadUsers(true);
					this.searching = false;
				}, 500);
			},
			
			// 清除搜索
			handleClear() {
				this.searchKeyword = '';
				this.loadUsers(true);
			},
			
			// 取消搜索
			handleCancel() {
				this.searchKeyword = '';
				this.loadUsers(true);
			},
			
			// 刷新数据
			async refresh() {
				await this.loadUsers(true);
			},
			
			// 加载更多
			async loadMore() {
				if (!this.hasMore || this.loading) return;
				
				this.loading = true;
				this.loadMoreStatus = 'loading';
				
				try {
					const params = await this.buildSearchParams(false);
					let res = await post(`table/user/search`, params);
					
					if (res && res.data) {
						this.handleSuccessResponse(res.data, res.total, false);
					}
				} catch (error) {
					console.error('加载更多失败:', error);
				} finally {
					this.loading = false;
				}
			},
			
			// 打开用户详情
			openUserDetail(user) {
				console.log('打开用户详情:', user);
				uni.navigateTo({
					url: '/pages/admin/user_detail?id=' + (user.id || user._id)
				});
			},
						
		}
	}
</script>

<style lang="scss">
	.user-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 10rpx;
		
		.user-id {
			font-size: 24rpx;
			color: #999;
		}
		
		.user-status {
			font-size: 24rpx;
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