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
					v-for="group in groups"
					:key="group.id"
					:title="group.name || '-'"
					:note="group.id"
					clickable
					@click="openGroup(group)">
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
	import { post } from '../../utils/request';

	export default {
		data() {
			return {
				searchKeyword: '',
				searchPlaceholder: '搜索组织名称',

				groups: [],

				pageSize: 20,
				currentPage: 0,
				totalCount: 0,
				hasMore: true,

				loading: false,
				loadingMore: false,
				searching: false,

				loadMoreStatus: 'loading',
				loadMoreText: {
					contentdown: '上拉显示更多',
					contentrefresh: '正在加载...',
					contentnomore: '没有更多组织了'
				}
			}
		},
		onLoad() {
			this.loadGroups(true);
		},
		onPullDownRefresh() {
			this.refresh();
		},
		onReachBottom() {
			if (this.hasMore && !this.loading) {
				this.loadMore();
			}
		},
		methods: {
			buildSearchParams(isRefresh = false) {
				const skip = isRefresh ? 0 : this.groups.length;
				const filter = {};

				if (this.searchKeyword) {
					filter.$or = {
						id: "%" + this.searchKeyword + "%",
						name: "%" + this.searchKeyword + "%",
					}
				}

				return {
					filter,
					skip,
					limit: this.pageSize,
					sort: { created: -1 },
					columns: ['id', 'name', 'disabled', 'created', 'user_id']
				};
			},

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
					const res = await post('table/group/search', params);

					if (res && res.data) {
						const newGroups = res.data || [];
						
						if (isRefresh) {
							this.groups = newGroups;
						} else {
							this.groups = [...this.groups, ...newGroups];
						}

						const total = res.total || 0;
						this.totalCount = total;
						this.hasMore = this.groups.length < total;

						// 如果返回的数据少于页面大小，说明没有更多了
						if (newGroups.length < this.pageSize) {
							this.hasMore = false;
						}

						this.loadMoreStatus = this.hasMore ? 'more' : 'noMore';

						if (this.searchKeyword && isRefresh && newGroups.length > 0) {
							uni.showToast({
								title: `找到${newGroups.length}个组织`,
								icon: 'none',
								duration: 1500
							});
						}
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

			handleSearch() {
				if (this.searching) return;

				this.searching = true;
				clearTimeout(this.searchTimer);
				this.searchTimer = setTimeout(() => {
					this.loadGroups(true);
					this.searching = false;
				}, 500);
			},

			handleClear() {
				this.searchKeyword = '';
				this.loadGroups(true);
			},

			handleCancel() {
				this.searchKeyword = '';
				this.loadGroups(true);
			},

			async refresh() {
				await this.loadGroups(true);
			},

			async loadMore() {
				if (!this.hasMore || this.loading) return;

				this.loading = true;
				this.loadMoreStatus = 'loading';

				try {
					const params = this.buildSearchParams(false);
					const res = await post('table/group/search', params);

					if (res && res.data) {
						const newGroups = res.data || [];
						this.groups = [...this.groups, ...newGroups];
						
						const total = res.total || 0;
						this.hasMore = this.groups.length < total;
						
						// 如果返回的数据少于页面大小，说明没有更多了
						if (newGroups.length < this.pageSize) {
							this.hasMore = false;
						}
						
						this.loadMoreStatus = this.hasMore ? 'more' : 'noMore';
					}
				} catch (error) {
					console.error('加载更多失败:', error);
					uni.showToast({
						title: '加载更多失败',
						icon: 'error'
					});
				} finally {
					this.loading = false;
				}
			},

			openGroup(group) {
				uni.navigateTo({
					url: '/sub/group/detail?id=' + group.id
				});
			},
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



