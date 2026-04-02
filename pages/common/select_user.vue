<template>
	<view class="page">
		<!-- 搜索框 -->
		<uni-card>
			<uni-search-bar
				placeholder="搜索手机号"
				v-model="searchKeyword"
				@confirm="handleSearch"
				@clear="handleClear"
				@cancel="handleCancel">
			</uni-search-bar>
		</uni-card>

		<!-- 用户列表 -->
		<uni-card v-if="users.length > 0" title="搜索结果">
			<uni-list>
				<uni-list-item
					v-for="user in users"
					:key="user.id || user._id"
					:title="formatUserName(user)"
					:note="user.cellphone || user.id"
					clickable
					@click="selectUser(user)">
					<template v-slot:header>
						<view class="user-header">
							<text class="user-id">ID: {{ user.id || user._id }}</text>
						</view>
					</template>
				</uni-list-item>
			</uni-list>
		</uni-card>

		<!-- 空状态 -->
		<view v-if="!loading && users.length === 0 && hasSearched" class="empty-state">
			<view class="empty-content">
				<uni-icons type="person" size="80" color="#ccc"></uni-icons>
				<text class="empty-text">未找到用户</text>
			</view>
		</view>

		<!-- 加载状态 -->
		<view v-if="loading" class="loading-state">
			<uni-load-more status="loading" content="搜索中..."></uni-load-more>
		</view>
	</view>
</template>

<script>
	import { post } from '../../utils/request';

	export default {
		data() {
			return {
				searchKeyword: '',
				users: [],
				loading: false,
				hasSearched: false,
				eventChannel: null
			}
		},
		onLoad(options) {
			this.eventChannel = this.getOpenerEventChannel();
		},
		methods: {
			// 搜索用户
			async handleSearch() {
				const keyword = (this.searchKeyword || '').trim();
				if (!keyword) {
					uni.showToast({
						title: '请输入手机号',
						icon: 'none'
					});
					return;
				}

				this.loading = true;
				this.hasSearched = true;
				this.users = [];

				try {
					const res = await post('table/user/search', {
						filter: {
							cellphone: keyword
						},
						skip: 0,
						limit: 50
					});

					if (res && res.data && res.data.length > 0) {
						this.users = res.data;
					} else {
						this.users = [];
					}
				} catch (error) {
					console.error('搜索用户失败:', error);
					uni.showToast({
						title: '搜索失败',
						icon: 'error'
					});
					this.users = [];
				} finally {
					this.loading = false;
				}
			},

			// 清除搜索
			handleClear() {
				this.searchKeyword = '';
				this.users = [];
				this.hasSearched = false;
			},

			// 取消搜索
			handleCancel() {
				this.searchKeyword = '';
				this.users = [];
				this.hasSearched = false;
			},

			// 选择用户
			selectUser(user) {
				if (this.eventChannel) {
					
					uni.navigateBack();
					this.eventChannel.emit('user', user);
				} else {
					
					uni.navigateBack({
						success: () => {
							
							uni.$emit('user-selected', user);
						}
					});
				}
			},

			
			formatUserName(user) {
				if (!user) return '';
				return user.name || user.nickname || user.username || user.realname || user.cellphone || user.id || '未知用户';
			}
		}
	}
</script>

<style lang="scss" scoped>
	.user-header {
		.user-id {
			font-size: 24rpx;
			color: #999;
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
		}
	}

	.loading-state {
		padding: 40rpx 0;
		text-align: center;
	}

	.uni-card {
		margin: 20rpx 30rpx;
		margin-top: 40rpx;
	}
</style>


