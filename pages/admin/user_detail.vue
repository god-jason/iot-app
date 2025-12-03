<template>
	<view>
		<!-- 用户基本信息卡片 -->
		<uni-card :title="user.name || '未知用户'" :sub-title="user.id || user._id">
			<view class="user-header">
				<image :src="getUserAvatar(user)" class="user-avatar" mode="aspectFill"></image>
				<view class="user-basic-info">
					<view class="user-name-status">
						<text class="user-name">{{ formatUserName(user) }}</text>
						<view class="user-status-badge" :style="getStatusBadgeStyle(user)">
							{{ getUserStatusText(user) }}
						</view>
					</view>
					<text class="user-id">ID: {{ user.id || user._id }}</text>
				</view>
			</view>
			
			<view class="user-details">
				<view class="detail-item" v-if="user.email">
					<uni-icons type="email" size="20" color="#007aff"></uni-icons>
					<text class="detail-label">邮箱:</text>
					<text class="detail-value">{{ user.email }}</text>
				</view>
				
				<view class="detail-item" v-if="user.phone">
					<uni-icons type="phone" size="20" color="#007aff"></uni-icons>
					<text class="detail-label">电话:</text>
					<text class="detail-value">{{ user.phone }}</text>
				</view>
				
				<view class="detail-item" v-if="user.username">
					<uni-icons type="contact" size="20" color="#007aff"></uni-icons>
					<text class="detail-label">用户名:</text>
					<text class="detail-value">{{ user.username }}</text>
				</view>
				
				<view class="detail-item" v-if="user.nickname">
					<uni-icons type="person" size="20" color="#007aff"></uni-icons>
					<text class="detail-label">昵称:</text>
					<text class="detail-value">{{ user.nickname }}</text>
				</view>
				
				<view class="detail-item" v-if="getCreateTime(user)">
					<uni-icons type="calendar" size="20" color="#007aff"></uni-icons>
					<text class="detail-label">注册时间:</text>
					<text class="detail-value">{{ getCreateTime(user) }}</text>
				</view>
				
				<view class="detail-item" v-if="user.last_login">
					<uni-icons type="eye" size="20" color="#007aff"></uni-icons>
					<text class="detail-label">最后登录:</text>
					<text class="detail-value">{{ formatTime(user.last_login) }}</text>
				</view>
			</view>
		</uni-card>

		<!-- 功能操作卡片 -->
		<uni-card>
			<uni-list :border="false">
				<!-- 修改信息 -->
				<uni-list-item 
					title="修改个人信息" 
					note="修改姓名、电话、邮箱等信息"
					show-arrow 
					clickable 
					@click="openEditUser"
					show-extra-icon
					:extra-icon="{color:'#007aff', size:'22', type:'compose'}">
				</uni-list-item>
				
				<!-- 启用/禁用 -->
				<uni-list-item 
					:title="user.disabled ? '启用用户' : '禁用用户'" 
					:note="user.disabled ? '启用该用户账号' : '禁用该用户账号'"
					show-arrow 
					clickable 
					@click="toggleUserStatus"
					show-extra-icon
					:extra-icon="{color: user.disabled ? '#4cd964' : '#ff3b30', size:'22', type: user.disabled ? 'checkmarkempty' : 'closeempty'}">
				</uni-list-item>
				
				<!-- 重置密码 -->
				<uni-list-item 
					title="重置密码" 
					note="重置用户登录密码"
					show-arrow 
					clickable 
					@click="resetPassword"
					show-extra-icon
					:extra-icon="{color:'#ff9500', size:'22', type:'locked'}">
				</uni-list-item>
			</uni-list>
		</uni-card>

		<!-- 所属组织 -->
		<uni-card title="所属组织" v-if="groups.length > 0">
			<uni-list>
				<uni-list-item 
					v-for="(group, index) in groups" 
					:key="group.id"
					:title="group.name"
					:note="group.role || '成员'"
					:rightText="group.disabled ? '已禁用' : '正常'"
					:rightTextStyle="getGroupStatusStyle(group)"
					show-arrow 
					clickable 
					@click="openGroup(group)">
				</uni-list-item>
			</uni-list>
		</uni-card>
		
		<view v-else class="no-groups">
			<text class="no-groups-text">该用户暂无加入的组织</text>
		</view>
	</view>
</template>

<script>
	import {
		get,
		post
	} from '../../utils/request';

	export default {
		data() {
			return {
				id: undefined,
				user: {},
				groups: [],
				loading: false
			}
		},
		onLoad(options) {
			this.id = options.id;
			if (this.id) {
				this.loadUserDetail();
				this.loadUserGroups();
			}
		},
		onShow() {
			// 页面显示时刷新数据
			if (this.id) {
				this.loadUserDetail();
			}
		},
		methods: {
			// 加载用户详情
			async loadUserDetail() {
				try {
					let res = await get(`table/user/detail/${this.id}`);
					if (res.data) {
						this.user = res.data;
						console.log('用户详情:', this.user);
					}
				} catch (error) {
					console.error('加载用户详情失败:', error);
					uni.showToast({
						title: '加载用户信息失败',
						icon: 'error'
					});
				}
			},
			
			// 加载用户所属组织
			async loadUserGroups() {
				try {
					// 这里需要根据实际接口调整
					// 假设通过 group_member 表查询
					let res = await post('table/group_member/search', {
						filter: {
							user_id: this.id
						},
						skip: 0,
						limit: 50
					});
					
					if (res && res.data) {
						// 获取组织详情
						const groupPromises = res.data.map(async (member) => {
							try {
								const groupRes = await get(`table/group/detail/${member.group_id}`);
								return {
									...groupRes.data,
									role: member.role
								};
							} catch (err) {
								return null;
							}
						});
						
						const groups = await Promise.all(groupPromises);
						this.groups = groups.filter(group => group !== null);
					}
				} catch (error) {
					console.error('加载用户组织失败:', error);
					// 使用模拟数据
					this.loadMockGroups();
				}
			},
			
			// 加载模拟组织数据
			loadMockGroups() {
				this.groups = [
					{
						id: 'group_001',
						name: '南京真格智能科技有限公司',
						disabled: false,
						role: '管理员'
					},
					{
						id: 'group_002',
						name: '南京本易物联网有限公司',
						disabled: false,
						role: '成员'
					}
				];
			},
			
			// 打开编辑用户页面
			openEditUser() {
				uni.navigateTo({
					url: `/pages/user/edit?id=${this.id}`
				});
			},
			
			// 切换用户状态（启用/禁用）
			async toggleUserStatus() {
				const newStatus = !this.user.disabled;
				const action = newStatus ? '禁用' : '启用';
				
				uni.showModal({
					title: '确认操作',
					content: `确定要${action}用户 ${this.formatUserName(this.user)} 吗？`,
					success: async (res) => {
						if (res.confirm) {
							this.loading = true;
							try {
								let res = await post(`table/user/update/${this.id}`, {
									disabled: newStatus ? 1 : 0
								});
								
								if (res && (res.data === 0 || res.data > 0 || res.code === 0)) {
									uni.showToast({
										title: `${action}成功`,
										icon: 'success'
									});
									
									// 更新本地数据
									this.user.disabled = newStatus;
									
									// 触发列表更新
									uni.$emit('user-status-changed', {
										id: this.id,
										disabled: newStatus
									});
								} else {
									uni.showToast({
										title: `${action}失败`,
										icon: 'error'
									});
								}
							} catch (error) {
								console.error(`${action}用户失败:`, error);
								uni.showToast({
									title: `${action}失败`,
									icon: 'error'
								});
							} finally {
								this.loading = false;
							}
						}
					}
				});
			},
			
			// 重置密码
			resetPassword() {
				uni.showModal({
					title: '重置密码',
					content: '确定要重置该用户的密码吗？新密码将通过其他方式通知用户。',
					showCancel: true,
					success: async (res) => {
						if (res.confirm) {
							try {
								// 这里调用重置密码接口
								let res = await post(`table/user/reset_password/${this.id}`, {});
								
								if (res && res.code === 0) {
									uni.showToast({
										title: '重置密码成功',
										icon: 'success'
									});
								} else {
									uni.showToast({
										title: res?.message || '重置失败',
										icon: 'error'
									});
								}
							} catch (error) {
								console.error('重置密码失败:', error);
								uni.showToast({
									title: '重置失败',
									icon: 'error'
								});
							}
						}
					}
				});
			},
			
			// 打开组织详情
			openGroup(group) {
				uni.navigateTo({
					url: `/pages/group/detail?id=${group.id}`
				});
			},
			
			// 获取用户头像
			getUserAvatar(user) {
				return user.avatar || '/static/avatar.jpg';
			},
			
			// 格式化用户名称
			formatUserName(user) {
				return user.name || user.username || user.nickname || user.realname || '未知用户';
			},
			
			// 获取用户状态文本
			getUserStatusText(user) {
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
			
			// 获取状态徽章样式
			getStatusBadgeStyle(user) {
				if (user.disabled === 1 || user.disabled === true) {
					return {
						backgroundColor: '#ff3b30',
						color: 'white'
					};
				}
				if (user.status === 'active' || user.status === 1) {
					return {
						backgroundColor: '#4cd964',
						color: 'white'
					};
				}
				return {
					backgroundColor: '#007aff',
					color: 'white'
				};
			},
			
			// 获取创建时间
			getCreateTime(user) {
				const timeField = user.created_at || user.createdAt || user.create_time;
				if (timeField) {
					return this.formatTime(timeField);
				}
				return '';
			},
			
			// 格式化时间
			formatTime(timeString) {
				if (!timeString) return '';
				
				try {
					const date = new Date(timeString);
					if (isNaN(date.getTime())) return timeString;
					
					return date.toLocaleDateString('zh-CN') + ' ' + 
						   date.toLocaleTimeString('zh-CN', { 
							   hour: '2-digit', 
							   minute: '2-digit' 
						   });
				} catch (e) {
					return timeString;
				}
			},
			
			// 获取组织状态样式
			getGroupStatusStyle(group) {
				if (group.disabled) {
					return {
						color: '#ff3b30',
						fontSize: '26rpx'
					};
				}
				return {
					color: '#4cd964',
					fontSize: '26rpx'
				};
			}
		}
	}
</script>

<style lang="scss">
	.user-header {
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
		
		.user-avatar {
			width: 120rpx;
			height: 120rpx;
			border-radius: 50%;
			margin-right: 30rpx;
		}
		
		.user-basic-info {
			flex: 1;
			
			.user-name-status {
				display: flex;
				align-items: center;
				margin-bottom: 10rpx;
				
				.user-name {
					font-size: 36rpx;
					font-weight: bold;
					color: #333;
					margin-right: 20rpx;
				}
				
				.user-status-badge {
					padding: 6rpx 20rpx;
					border-radius: 20rpx;
					font-size: 24rpx;
					font-weight: normal;
				}
			}
			
			.user-id {
				font-size: 28rpx;
				color: #999;
			}
		}
	}
	
	.user-details {
		.detail-item {
			display: flex;
			align-items: center;
			margin-bottom: 20rpx;
			padding-bottom: 20rpx;
			border-bottom: 1rpx solid #f5f5f5;
			
			&:last-child {
				margin-bottom: 0;
				padding-bottom: 0;
				border-bottom: none;
			}
			
			.uni-icons {
				margin-right: 15rpx;
				flex-shrink: 0;
			}
			
			.detail-label {
				font-weight: bold;
				color: #333;
				margin-right: 15rpx;
				min-width: 120rpx;
				flex-shrink: 0;
			}
			
			.detail-value {
				color: #666;
				flex: 1;
				word-break: break-all;
			}
		}
	}
	
	.no-groups {
		text-align: center;
		padding: 60rpx 0;
		
		.no-groups-text {
			font-size: 28rpx;
			color: #999;
		}
	}
</style>