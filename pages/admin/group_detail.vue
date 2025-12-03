<template>
	<view>
		<!-- 组织基本信息 -->
		<uni-card :title="group.name" :sub-title="group.id" :extra="group.disabled ? '已禁用' : '正常'">
			<view class="group-info">
				<view class="info-item">
					<uni-icons type="person" size="20" color="#007aff"></uni-icons>
					<text class="info-label">创建者:</text>
					<text class="info-value">{{ group.user_id || '未知' }}</text>
				</view>
				
				<view class="info-item">
					<uni-icons type="calendar" size="20" color="#007aff"></uni-icons>
					<text class="info-label">创建时间:</text>
					<text class="info-value">{{ formatTime(group.created) }}</text>
				</view>
				
				<view v-if="group.phone" class="info-item">
					<uni-icons type="phone" size="20" color="#007aff"></uni-icons>
					<text class="info-label">联系电话:</text>
					<text class="info-value">{{ group.phone }}</text>
				</view>
				
				<view v-if="group.alert_phone" class="info-item">
					<uni-icons type="sound" size="20" color="#ff3b30"></uni-icons>
					<text class="info-label">报警电话:</text>
					<text class="info-value">{{ group.alert_phone }}</text>
				</view>
			</view>
		</uni-card>

		<!-- 功能列表 -->
		<uni-card>
			<uni-list :border="false">
				<!-- 成员管理 -->
				<uni-list-item 
					title="成员管理" 
					note="绑定、解绑组织成员"
					show-arrow 
					clickable 
					@click="openMemberManagement"
					show-extra-icon
					:extra-icon="{color:'#007aff', size:'22', type:'person-filled'}">
				</uni-list-item>
				
				<!-- 修改信息 -->
				<uni-list-item 
					title="修改信息" 
					note="修改组织名称、联系电话等"
					show-arrow 
					clickable 
					@click="openEditGroup"
					show-extra-icon
					:extra-icon="{color:'#007aff', size:'22', type:'compose'}">
				</uni-list-item>
			</uni-list>
		</uni-card>

		<!-- 成员列表 -->
		<uni-card title="组织成员">
			<view v-if="members.length > 0">
				<uni-list>
					<uni-list-item 
						v-for="(member, index) in members" 
						:key="member.id"
						:title="member.name || member.username || member.user_id"
						:note="formatMemberNote(member)"
						:rightText="member.role || '成员'"
						:rightTextStyle="getRoleStyle(member)"
						show-extra-icon
						:extra-icon="{color:'#999', size:'20', type:'person'}"
						@click="showMemberActions(member)">
					</uni-list-item>
				</uni-list>
			</view>
			
			<view v-else class="empty-members">
				<uni-icons type="person" size="60" color="#ccc"></uni-icons>
				<text class="empty-text">暂无成员</text>
				<button type="default" size="mini" @click="openMemberManagement">添加成员</button>
			</view>
			
			<view v-if="membersLoading" class="loading-members">
				<uni-load-more status="loading" content="加载中..."></uni-load-more>
			</view>
		</uni-card>
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
				group: {
					id: '',
					name: '',
					disabled: false,
					created: '',
					user_id: '',
					phone: '',
					alert_phone: ''
				},
				members: [],
				membersLoading: false
			}
		},
		onLoad(options) {
			this.id = options.id;
			if (this.id) {
				this.loadGroupDetail();
				this.loadMembers();
			}
		},
		onShow() {
			// 页面显示时刷新数据
			if (this.id) {
				this.loadGroupDetail();
				this.loadMembers();
			}
		},
		methods: {
			// 加载组织详情
			async loadGroupDetail() {
				try {
					let res = await get(`table/group/detail/${this.id}`);
					if (res.data) {
						this.group = res.data;
						console.log('组织详情:', this.group);
					}
				} catch (error) {
					console.error('加载组织详情失败:', error);
					uni.showToast({
						title: '加载组织信息失败',
						icon: 'error'
					});
				}
			},
			
			// 加载组织成员
			async loadMembers() {
				this.membersLoading = true;
				try {
					// 这里需要根据你的实际接口来调整
					// 假设有获取组织成员的接口
					let res = await post('table/group_member/search', {
						filter: {
							group_id: this.id
						},
						skip: 0,
						limit: 100
					});
					
					if (res && res.data) {
						this.members = res.data || [];
						console.log('组织成员:', this.members);
					}
				} catch (error) {
					console.error('加载成员失败:', error);
					// 如果没有专门的成员表，可以使用模拟数据
					this.loadMockMembers();
				} finally {
					this.membersLoading = false;
				}
			},
			
			// 加载模拟成员数据（备用）
			async loadMockMembers() {
				// 模拟成员数据
				this.members = [
					{
						id: 'user_001',
						user_id: 'user_001',
						name: '张三',
						username: 'zhangsan',
						role: '管理员',
						email: 'zhangsan@example.com',
						phone: '13800138001',
						join_time: new Date().toISOString()
					},
					{
						id: 'user_002',
						user_id: 'user_002',
						name: '李四',
						username: 'lisi',
						role: '成员',
						email: 'lisi@example.com',
						phone: '13800138002',
						join_time: new Date(Date.now() - 86400000).toISOString()
					},
					{
						id: 'user_003',
						user_id: 'user_003',
						name: '王五',
						username: 'wangwu',
						role: '成员',
						email: 'wangwu@example.com',
						phone: '13800138003',
						join_time: new Date(Date.now() - 172800000).toISOString()
					}
				];
			},
			
			// 打开成员管理页面
			openMemberManagement() {
				uni.navigateTo({
					url: `/pages/group/member?group_id=${this.id}`
				});
			},
			
			// 打开编辑组织页面
			openEditGroup() {
				uni.navigateTo({
					url: `/pages/group/edit?id=${this.id}`
				});
			},
			
			// 显示成员操作菜单
			showMemberActions(member) {
				const items = ['设为管理员', '取消管理员', '移除成员'];
				
				uni.showActionSheet({
					itemList: items,
					success: (res) => {
						const index = res.tapIndex;
						switch(index) {
							case 0: // 设为管理员
								this.setMemberRole(member, 'admin');
								break;
							case 1: // 取消管理员
								this.setMemberRole(member, 'member');
								break;
							case 2: // 移除成员
								this.removeMember(member);
								break;
						}
					}
				});
			},
			
			// 设置成员角色
			async setMemberRole(member, role) {
				uni.showModal({
					title: '提示',
					content: `确定将 ${member.name || member.username} ${role === 'admin' ? '设为管理员' : '设为普通成员'} 吗？`,
					success: async (res) => {
						if (res.confirm) {
							try {
								let res = await post(`table/group_member/update/${member.id}`, {
									role: role
								});
								
								if (res && res.data === 0) {
									uni.showToast({
										title: '操作成功',
										icon: 'success'
									});
									// 刷新成员列表
									this.loadMembers();
								}
							} catch (error) {
								console.error('设置角色失败:', error);
								uni.showToast({
									title: '操作失败',
									icon: 'error'
								});
							}
						}
					}
				});
			},
			
			// 移除成员
			async removeMember(member) {
				uni.showModal({
					title: '确认移除',
					content: `确定要移除成员 ${member.name || member.username} 吗？`,
					success: async (res) => {
						if (res.confirm) {
							try {
								let res = await get(`table/group_member/delete/${member.id}`);
								
								if (res && res.data === 0) {
									uni.showToast({
										title: '移除成功',
										icon: 'success'
									});
									// 刷新成员列表
									this.loadMembers();
								}
							} catch (error) {
								console.error('移除成员失败:', error);
								uni.showToast({
									title: '移除失败',
									icon: 'error'
								});
							}
						}
					}
				});
			},
			
			// 格式化时间
			formatTime(timestamp) {
				if (!timestamp) return '';
				
				try {
					const date = new Date(timestamp);
					if (isNaN(date.getTime())) {
						// 尝试将 created 当作时间戳
						const timestampNum = parseInt(timestamp);
						if (!isNaN(timestampNum)) {
							const dateFromTimestamp = new Date(timestampNum);
							if (!isNaN(dateFromTimestamp.getTime())) {
								return dateFromTimestamp.toLocaleDateString('zh-CN') + ' ' + 
									   dateFromTimestamp.toLocaleTimeString('zh-CN', { 
										   hour: '2-digit', 
										   minute: '2-digit' 
									   });
							}
						}
						return timestamp;
					}
					
					return date.toLocaleDateString('zh-CN') + ' ' + 
						   date.toLocaleTimeString('zh-CN', { 
							   hour: '2-digit', 
							   minute: '2-digit' 
						   });
					
				} catch (e) {
					return timestamp;
				}
			},
			
			// 格式化成员备注
			formatMemberNote(member) {
				const notes = [];
				if (member.email) {
					notes.push(member.email);
				}
				if (member.phone) {
					notes.push(member.phone);
				}
				if (member.join_time) {
					notes.push('加入: ' + this.formatMemberTime(member.join_time));
				}
				return notes.join(' | ');
			},
			
			// 格式化成员时间
			formatMemberTime(timeString) {
				if (!timeString) return '';
				try {
					const date = new Date(timeString);
					const now = new Date();
					const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
					
					if (diffDays === 0) {
						return '今天';
					} else if (diffDays === 1) {
						return '昨天';
					} else if (diffDays < 7) {
						return `${diffDays}天前`;
					} else if (diffDays < 30) {
						return `${Math.floor(diffDays / 7)}周前`;
					} else {
						return date.toLocaleDateString('zh-CN');
					}
				} catch (e) {
					return timeString;
				}
			},
			
			// 获取角色样式
			getRoleStyle(member) {
				if (member.role === 'admin' || member.role === '管理员') {
					return {
						color: '#ff9500',
						fontSize: '26rpx',
						fontWeight: 'bold'
					};
				}
				return {
					color: '#666',
					fontSize: '26rpx'
				};
			}
		}
	}
</script>

<style lang="scss">
	.group-info {
		.info-item {
			display: flex;
			align-items: center;
			margin-bottom: 20rpx;
			
			&:last-child {
				margin-bottom: 0;
			}
			
			.uni-icons {
				margin-right: 15rpx;
			}
			
			.info-label {
				font-weight: bold;
				color: #333;
				margin-right: 15rpx;
				min-width: 120rpx;
			}
			
			.info-value {
				color: #666;
				flex: 1;
			}
		}
	}
	
	.empty-members {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60rpx 0;
		
		.empty-text {
			font-size: 32rpx;
			color: #999;
			margin: 30rpx 0 40rpx;
		}
		
		button {
			width: 200rpx;
			height: 70rpx;
			line-height: 70rpx;
			font-size: 28rpx;
			background-color: #007aff;
			color: white;
			border-radius: 35rpx;
		}
	}
	
	.loading-members {
		padding: 30rpx 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>