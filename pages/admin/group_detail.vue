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

		<!-- 添加成员 -->
		<uni-card title="添加成员">
			<view class="add-member-section">
				<uni-forms :modelValue="newMember" :label-width="100">
					<uni-forms-item label="用户ID" required>
						<uni-easyinput 
							v-model="newMember.user_id" 
							placeholder="请输入用户ID" 
							:disabled="addingMember" />
					</uni-forms-item>
				</uni-forms>
				
				<button type="primary" @click="addMember" :loading="addingMember">添加成员</button>
			</view>
		</uni-card>

		<!-- 成员列表 -->
		<uni-card title="组织成员">
			<view v-if="members.length > 0">
				<uni-list>
					<uni-list-item 
						v-for="(member, index) in members" 
						:key="member.user_id + '_' + member.group_id"
						:title="getMemberName(member)"
						:note="formatMemberNote(member)"
						:rightText="member.disabled ? '已禁用' : '正常'"
						:rightTextStyle="getMemberStatusStyle(member)"
						show-extra-icon
						:extra-icon="{color:'#999', size:'20', type:'person'}"
						@click="showMemberActions(member, index)">
					</uni-list-item>
				</uni-list>
			</view>
			
			<view v-else class="empty-members">
				<uni-icons type="person" size="60" color="#ccc"></uni-icons>
				<text class="empty-text">暂无成员</text>
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
				newMember: {
					user_id: ''
				},
				membersLoading: false,
				addingMember: false,
				// 存储用户详情信息
				userDetails: {}
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
					// 使用正确的表名和查询参数
					let res = await post('table/member/search', {
						filter: {
							group_id: this.id
						},
						skip: 0,
						limit: 100,
						sort: { created: -1 }
					});
					
					if (res && res.data) {
						this.members = res.data || [];
						console.log('组织成员:', this.members);
						
						// 加载用户详情信息
						await this.loadUserDetails();
					}
				} catch (error) {
					console.error('加载成员失败:', error);
				} finally {
					this.membersLoading = false;
				}
			},
			
			// 加载用户详情信息
			async loadUserDetails() {
				if (this.members.length === 0) return;
				
				// 收集所有用户ID
				const userIds = this.members.map(member => member.user_id).filter(Boolean);
				if (userIds.length === 0) return;
				
				try {
					let res = await post('table/user/search', {
						filter: {
							id: userIds
						},
						skip: 0,
						limit: 100
					});
					
					if (res && res.data) {
						// 将用户信息存储到映射中
						res.data.forEach(user => {
							this.userDetails[user.id] = user;
						});
					}
				} catch (error) {
					console.error('加载用户详情失败:', error);
				}
			},
			
			// 获取成员名称
			getMemberName(member) {
				const userInfo = this.userDetails[member.user_id];
				if (userInfo) {
					return userInfo.name || userInfo.username || userInfo.nickname || member.user_id;
				}
				return member.user_id || '未知成员';
			},
			
			// 打开编辑组织页面
			openEditGroup() {
				uni.navigateTo({
					url: `/pages/group/edit?id=${this.id}`
				});
			},
			
			// 添加成员
			async addMember() {
				if (!this.newMember.user_id.trim()) {
					uni.showToast({
						title: '请输入用户ID',
						icon: 'none'
					});
					return;
				}
				
				this.addingMember = true;
				
				try {
					// 检查用户是否存在
					let userRes = await get(`table/user/detail/${this.newMember.user_id}`).catch(() => null);
					if (!userRes || !userRes.data) {
						uni.showToast({
							title: '用户不存在',
							icon: 'error'
						});
						return;
					}
					
					// 检查是否已经是成员
					const isMember = this.members.some(m => m.user_id === this.newMember.user_id);
					if (isMember) {
						uni.showToast({
							title: '用户已是成员',
							icon: 'none'
						});
						return;
					}
					
					// 添加成员
					const memberData = {
						group_id: this.id,
						user_id: this.newMember.user_id,
						disabled: false
					};
					
					let res = await post('table/member/create', memberData);
					
					if (res && (res.code === 0 || res.data === 0)) {
						uni.showToast({
							title: '添加成功',
							icon: 'success'
						});
						
						// 清空表单
						this.newMember.user_id = '';
						
						// 添加新成员到列表
						const newMember = {
							group_id: this.id,
							user_id: userRes.data.id,
							disabled: false,
							created: new Date().toISOString()
						};
						
						this.members.unshift(newMember);
						
						// 缓存用户信息
						this.userDetails[userRes.data.id] = userRes.data;
						
						// 重新排序
						this.members.sort((a, b) => new Date(b.created) - new Date(a.created));
						
					} else {
						uni.showToast({
							title: res?.message || '添加失败',
							icon: 'error'
						});
					}
				} catch (error) {
					console.error('添加成员失败:', error);
					uni.showToast({
						title: '添加失败',
						icon: 'error'
					});
				} finally {
					this.addingMember = false;
				}
			},
			
			// 显示成员操作菜单（简化版，只有启用/禁用和移除）
			showMemberActions(member, index) {
				const items = member.disabled ? ['启用成员', '移除成员'] : ['禁用成员', '移除成员'];
				
				uni.showActionSheet({
					itemList: items,
					success: (res) => {
						const actionIndex = res.tapIndex;
						const memberName = this.getMemberName(member);
						
						switch(actionIndex) {
							case 0: // 启用/禁用成员
								this.toggleMemberStatus(member, index, !member.disabled);
								break;
							case 1: // 移除成员
								this.removeMember(member, index);
								break;
						}
					}
				});
			},
			
			// 切换成员状态（启用/禁用）
			async toggleMemberStatus(member, index, newStatus) {
				const action = newStatus ? '禁用' : '启用';
				const memberName = this.getMemberName(member);
				
				uni.showModal({
					title: '确认操作',
					content: `确定要${action}成员 ${memberName} 吗？`,
					success: async (res) => {
						if (res.confirm) {
							try {
								// 更新成员状态 - 使用复合主键
								let res = await post(`table/member/update`, {
									group_id: member.group_id,
									user_id: member.user_id,
									disabled: newStatus
								});
								
								if (res && (res.data === 0 || res.data > 0 || res.code === 0)) {
									uni.showToast({
										title: `${action}成功`,
										icon: 'success'
									});
									
									// 更新本地数据
									this.members[index].disabled = newStatus;
									this.$forceUpdate();
								} else {
									uni.showToast({
										title: res?.message || `${action}失败`,
										icon: 'error'
									});
								}
							} catch (error) {
								console.error(`${action}成员失败:`, error);
								uni.showToast({
									title: `${action}失败`,
									icon: 'error'
								});
							}
						}
					}
				});
			},
			
			// 移除成员
			async removeMember(member, index) {
				const memberName = this.getMemberName(member);
				
				uni.showModal({
					title: '确认移除',
					content: `确定要移除成员 ${memberName} 吗？`,
					success: async (res) => {
						if (res.confirm) {
							try {
								// 移除成员 - 使用复合主键
								let res = await get(`table/member/delete?group_id=${member.group_id}&user_id=${member.user_id}`);
								
								if (res && res.data === 0) {
									uni.showToast({
										title: '移除成功',
										icon: 'success'
									});
									
									// 从列表中移除
									this.members.splice(index, 1);
									
									// 移除用户详情缓存
									delete this.userDetails[member.user_id];
								} else {
									uni.showToast({
										title: res?.message || '移除失败',
										icon: 'error'
									});
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
				const userInfo = this.userDetails[member.user_id];
				
				if (userInfo) {
					if (userInfo.email) notes.push(userInfo.email);
					if (userInfo.phone) notes.push(userInfo.phone);
				}
				
				if (member.created) {
					notes.push('加入: ' + this.formatMemberTime(member.created));
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
			
			// 获取成员状态样式
			getMemberStatusStyle(member) {
				if (member.disabled) {
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
	
	.add-member-section {
		padding: 20rpx 0;
		
		button {
			margin-top: 20rpx;
			height: 70rpx;
			border-radius: 8rpx;
			font-size: 28rpx;
			background-color: #007aff;
			color: white;
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
	}
	
	.loading-members {
		padding: 30rpx 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>