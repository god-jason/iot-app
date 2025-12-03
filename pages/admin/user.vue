<template>
	<view>
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
					:key="user.id || user._id || index"
					:title="formatUserName(user)"
					:note="formatUserNote(user)"
					:avatar="getUserAvatar(user)"
					:avatar-circle="true"
					:time="formatUserTime(user)"
					clickable 
					@click="openUserDetail(user)">
					
					<template v-slot:footer>
						<view class="user-footer">
							<text class="user-id">ID: {{ user.id || user._id }}</text>
							<text class="user-status" :style="getUserStatusStyle(user)">
								{{ getUserStatus(user) }}
							</text>
						</view>
					</template>
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
		
		<!-- 调试信息 -->
		<view v-if="showDebug" class="debug-info">
			<text>当前表名: {{ currentTableName }}</text>
			<text>可用字段: {{ JSON.stringify(availableFields) }}</text>
			<text>数据量: {{ users.length }} / {{ totalCount }}</text>
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
				
				// 调试信息
				showDebug: false,
				currentTableName: 'user',
				availableFields: [],
				searchTimer: null
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
			// 探测用户表字段
			async detectUserFields() {
				try {
					const testParams = {
						filter: {},
						skip: 0,
						limit: 1
					};
					
					let res = await post(`table/${this.currentTableName}/search`, testParams);
					
					if (res && res.data && res.data.length > 0) {
						this.availableFields = Object.keys(res.data[0]);
						console.log('用户表可用字段:', this.availableFields);
					}
				} catch (error) {
					console.log('字段探测失败:', error);
				}
			},
			
			// 构建搜索参数
			async buildSearchParams(isRefresh = false) {
				const skip = isRefresh ? 0 : this.users.length;
				
				// 如果没有字段信息，先探测
				if (this.availableFields.length === 0) {
					await this.detectUserFields();
				}
				
				// 基础过滤条件
				const filter = {};
				
				// 添加搜索关键词过滤
				if (this.searchKeyword.trim()) {
					// 根据可用字段选择搜索字段
					const searchFields = [];
					
					// 尝试可能的姓名字段
					if (this.availableFields.includes('name')) searchFields.push('name');
					if (this.availableFields.includes('username')) searchFields.push('username');
					if (this.availableFields.includes('nickname')) searchFields.push('nickname');
					if (this.availableFields.includes('realname')) searchFields.push('realname');
					
					// 如果有可搜索的字段
					if (searchFields.length > 0) {
						// 使用简单的相等匹配
						// 注意：后端可能不支持 $or，这里简化处理
						filter[searchFields[0]] = this.searchKeyword;
					}
				}
				
				// 构建查询字段
				const columns = [];
				
				// 基本信息字段
				if (this.availableFields.includes('id')) columns.push('id');
				if (this.availableFields.includes('_id')) columns.push('_id');
				if (this.availableFields.includes('name')) columns.push('name');
				if (this.availableFields.includes('username')) columns.push('username');
				if (this.availableFields.includes('nickname')) columns.push('nickname');
				if (this.availableFields.includes('avatar')) columns.push('avatar');
				if (this.availableFields.includes('email')) columns.push('email');
				if (this.availableFields.includes('phone')) columns.push('phone');
				if (this.availableFields.includes('status')) columns.push('status');
				if (this.availableFields.includes('disabled')) columns.push('disabled');
				
				// 时间字段
				if (this.availableFields.includes('created_at')) columns.push('created_at');
				if (this.availableFields.includes('createdAt')) columns.push('createdAt');
				if (this.availableFields.includes('create_time')) columns.push('create_time');
				if (this.availableFields.includes('update_time')) columns.push('update_time');
				if (this.availableFields.includes('updatedAt')) columns.push('updatedAt');
				if (this.availableFields.includes('last_login')) columns.push('last_login');
				
				return {
					filter: filter,
					skip: skip,
					limit: this.pageSize,
					sort: this.getSortField(),
					columns: columns.length > 0 ? columns : undefined
				};
			},
			
			// 获取排序字段
			getSortField() {
				// 根据可用字段选择排序字段
				if (this.availableFields.includes('created_at')) {
					return { created_at: -1 };
				} else if (this.availableFields.includes('createdAt')) {
					return { createdAt: -1 };
				} else if (this.availableFields.includes('create_time')) {
					return { create_time: -1 };
				} else if (this.availableFields.includes('update_time')) {
					return { update_time: -1 };
				} else if (this.availableFields.includes('updatedAt')) {
					return { updatedAt: -1 };
				} else {
					return {}; // 不排序
				}
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
					
					let res = await post(`table/${this.currentTableName}/search`, params);
					console.log('用户接口响应:', res);
					
					if (res && res.data) {
						this.handleSuccessResponse(res.data, res.total, isRefresh);
					}
				} catch (error) {
					console.error('加载用户失败:', error);
					
					// 尝试简化查询
					if (error.message.includes('column') || error.message.includes('Unknown')) {
						await this.trySimplestQuery(isRefresh);
					} else {
						uni.showToast({
							title: '加载失败，请重试',
							icon: 'error'
						});
					}
				} finally {
					this.loading = false;
					uni.stopPullDownRefresh();
				}
			},
			
			// 尝试最简化查询
			async trySimplestQuery(isRefresh = false) {
				try {
					const skip = isRefresh ? 0 : this.users.length;
					
					// 最简参数
					const params = {
						filter: {},
						skip: skip,
						limit: this.pageSize
					};
					
					let res = await post(`table/${this.currentTableName}/search`, params);
					
					if (res && res.data) {
						this.handleSuccessResponse(res.data, res.total, isRefresh);
					}
				} catch (error) {
					console.error('最简化查询也失败:', error);
					// 使用模拟数据
					this.useMockData(isRefresh);
				}
			},
			
			// 处理成功响应
			handleSuccessResponse(newUsers, total, isRefresh) {
				// 前端过滤搜索关键词
				if (this.searchKeyword.trim() && newUsers.length > 0) {
					const keyword = this.searchKeyword.toLowerCase();
					newUsers = newUsers.filter(user => {
						// 收集所有可能的搜索字段
						const searchableText = [
							user.name,
							user.username,
							user.nickname,
							user.realname,
							user.email,
							user.phone,
							user.id,
							user._id
						].filter(Boolean).join(' ').toLowerCase();
						
						return searchableText.includes(keyword);
					});
				}
				
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
				
				// 更新可用字段信息
				if (newUsers.length > 0 && this.availableFields.length === 0) {
					this.availableFields = Object.keys(newUsers[0]);
					console.log('从结果中探测到的字段:', this.availableFields);
				}
				
				// 搜索提示
				if (this.searchKeyword && isRefresh) {
					uni.showToast({
						title: `找到${newUsers.length}个用户`,
						icon: 'none',
						duration: 1500
					});
				}
			},
			
			// 使用模拟数据（备用）
			useMockData(isRefresh) {
				console.log('使用模拟数据');
				let mockUsers = [
					{
						id: "123123",
						name: '张三',
						avatar: "/static/avatar.jpg",
						email: 'zhangsan@example.com',
						phone: '13800138001',
						status: 'active',
						created_at: new Date().toISOString()
					},
					{
						id: "123124",
						name: '李四',
						avatar: "/static/avatar.jpg",
						email: 'lisi@example.com',
						phone: '13800138002',
						status: 'active',
						created_at: new Date(Date.now() - 86400000).toISOString()
					},
					{
						id: "123125",
						name: '王五',
						avatar: "/static/avatar.jpg",
						email: 'wangwu@example.com',
						phone: '13800138003',
						status: 'inactive',
						created_at: new Date(Date.now() - 172800000).toISOString()
					}
				];
				
				// 过滤搜索关键词
				if (this.searchKeyword.trim()) {
					const keyword = this.searchKeyword.toLowerCase();
					mockUsers = mockUsers.filter(user => 
						user.name.toLowerCase().includes(keyword) ||
						(user.email && user.email.toLowerCase().includes(keyword)) ||
						(user.phone && user.phone.includes(keyword))
					);
				}
				
				this.handleSuccessResponse(mockUsers, mockUsers.length, isRefresh);
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
					let res = await post(`table/${this.currentTableName}/search`, params);
					
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
			
			// 格式化用户名称
			formatUserName(user) {
				return user.name || user.username || user.nickname || user.realname || '未知用户';
			},
			
			// 格式化用户备注
			formatUserNote(user) {
				const notes = [];
				if (user.email) notes.push(user.email);
				if (user.phone) notes.push(user.phone);
				return notes.join(' | ');
			},
			
			// 获取用户头像
			getUserAvatar(user) {
				return user.avatar || '/static/avatar.jpg';
			},
			
			// 格式化用户时间
			formatUserTime(user) {
				const timeField = user.last_login || user.update_time || user.updatedAt || user.created_at || user.createdAt;
				if (!timeField) return '';
				
				try {
					const date = new Date(timeField);
					if (isNaN(date.getTime())) return '';
					
					const now = new Date();
					const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
					
					if (diffDays === 0) {
						return '今天';
					} else if (diffDays === 1) {
						return '昨天';
					} else if (diffDays < 7) {
						return `${diffDays}天前`;
					} else {
						return date.toLocaleDateString('zh-CN');
					}
				} catch (e) {
					return '';
				}
			},
			
			// 获取用户状态
			getUserStatus(user) {
				if (user.disabled === 1 || user.disabled === true) {
					return '已禁用';
				}
				if (user.status === 'active' || user.status === 1) {
					return '活跃';
				}
				if (user.status === 'inactive' || user.status === 0) {
					return '未激活';
				}
				return '正常';
			},
			
			// 获取用户状态样式
			getUserStatusStyle(user) {
				if (user.disabled === 1 || user.disabled === true) {
					return {
						color: '#ff3b30',
						fontSize: '24rpx'
					};
				}
				if (user.status === 'active' || user.status === 1) {
					return {
						color: '#4cd964',
						fontSize: '24rpx'
					};
				}
				return {
					color: '#999',
					fontSize: '24rpx'
				};
			}
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
	
	.debug-info {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 10rpx;
		font-size: 24rpx;
		display: flex;
		flex-direction: column;
		z-index: 999;
	}
	
	@keyframes pulse {
		0%, 100% { opacity: 0.6; }
		50% { opacity: 1; }
	}
</style>