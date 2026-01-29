<template>
	<view class="page">
		<!-- 组织基本信息 -->
		<uni-card :title="group.name" :sub-title="group.id" :extra="group.disabled ? '已禁用' : '正常'">
			<view class="info-item">
				<text class="info-label">创建者:</text>
				<text class="info-value">{{ group.user_id || '未知' }}</text>
			</view>
			<view class="info-item">
				<text class="info-label">创建时间:</text>
				<text class="info-value">{{ formatTime(group.created) }}</text>
			</view>
		</uni-card>

		<!-- 功能列表 -->
		<uni-card>
			<uni-list>
				<uni-list-item 
					title="修改信息" 
					show-arrow 
					clickable 
					@click="openEditGroup"
					:extra-icon="{type:'compose'}">
				</uni-list-item>
				
				<uni-list-item 
					title="扫码添加成员" 
					show-arrow 
					clickable 
					@click="scanAndAddMember"
					:disabled="scanning"
					:extra-icon="{type:'scan'}">
					<template v-slot:right>
						<uni-load-more v-if="scanning" status="loading" :iconSize="16"></uni-load-more>
					</template>
				</uni-list-item>
			</uni-list>
		</uni-card>

		<!-- 成员列表 -->
		<uni-card title="组织成员">
			<uni-list v-if="members.length > 0">
				<uni-list-item 
					v-for="member in members" 
					:key="member.user_id"
					:title="member.user_id"
					:note="formatTime(member.created)"
					:rightText="member.disabled ? '已禁用' : '正常'"
					:rightTextStyle="member.disabled ? errorStyle : normalStyle"
					:extra-icon="{type:'person'}">
					<template v-slot:footer>
						<view class="member-actions">
							<button class="delete-btn" @click.stop="removeMember(member)">移除</button>
						</view>
					</template>
				</uni-list-item>
			</uni-list>
			
			<view v-else class="empty">
				<text>暂无成员</text>
				<view class="scan-btn" @click="scanAndAddMember">
					<text>扫码添加成员</text>
				</view>
			</view>
		</uni-card>
	</view>
</template>

<script>
	import { get, post } from '../../utils/request';

	export default {
		data() {
			return {
				id: '',
				group: {},
				members: [],
				scanning: false,
				errorStyle: { color: '#ff3b30' },
				normalStyle: { color: '#4cd964' }
			}
		},
		onLoad(options) {
			this.id = options.id;
			this.load();
		},
		methods: {
			// 统一加载
			async load() {
				await Promise.all([
					this.loadGroupDetail(),
					this.loadMembers()
				]);
			},
			
			// 加载组织详情
			async loadGroupDetail() {
				try {
					const res = await get(`table/group/detail/${this.id}`);
					this.group = res.data || {};
				} catch (error) {
					console.error('加载组织详情失败:', error);
				}
			},
			
			// 加载组织成员
			async loadMembers() {
				try {
					const res = await post('table/member/search', {
						filter: { group_id: this.id },
						limit: 100
					});
					this.members = res.data || [];
				} catch (error) {
					console.error('加载成员失败:', error);
				}
			},
			
			// 扫码添加成员
			async scanAndAddMember() {
				this.scanning = true;
				
				try {
					// 扫码
					const scanResult = await uni.scanCode({
						scanType: ['qrCode'],
						onlyFromCamera: true
					});
					
					// 提取用户ID
					const userId = this.extractUserId(scanResult.result);
					if (!userId) {
						uni.showToast({ title: '未识别到用户ID', icon: 'none' });
						return;
					}
					
					// 检查是否已是成员
					if (this.members.some(m => m.user_id === userId)) {
						uni.showToast({ title: '用户已是成员', icon: 'none' });
						return;
					}
					
					// 添加成员
					const memberData = {
						group_id: this.id,
						user_id: userId,
						disabled: false
					};
					
					const res = await post('table/member/create', memberData);
					
					if (res.code === 0) {
						uni.showToast({ title: '添加成功', icon: 'success' });
						
						// 添加新成员到列表
						this.members.unshift({
							...memberData,
							created: new Date().toISOString()
						});
					} else {
						uni.showToast({ title: res.message || '添加失败', icon: 'error' });
					}
					
				} catch (error) {
					if (error.errMsg && !error.errMsg.includes('cancel')) {
						uni.showToast({ title: '扫码失败', icon: 'error' });
					}
				} finally {
					this.scanning = false;
				}
			},
			
			// 提取用户ID
			extractUserId(result) {
				if (!result) return '';
				
				// 尝试解析JSON
				if (result.startsWith('{')) {
					try {
						const parsed = JSON.parse(result);
						return parsed.user_id || parsed.id || result;
					} catch (e) {
						return result.trim();
					}
				}
				
				return result.trim();
			},
			
			// 移除成员
			async removeMember(member) {
				uni.showModal({
					title: '移除成员',
					content: `确定要移除成员 ${member.user_id} 吗？`,
					success: async (res) => {
						if (res.confirm) {
							try {
								const res = await get(`table/member/delete/${member.group_id}/${member.user_id}`);
								
								if (res.code === 0 || res.data === 0) {
									uni.showToast({ title: '移除成功', icon: 'success' });
									
									const index = this.members.findIndex(m => 
										m.group_id === member.group_id && m.user_id === member.user_id
									);
									if (index !== -1) {
										this.members.splice(index, 1);
									}
								} else {
									uni.showToast({ title: res.message || '移除失败', icon: 'error' });
								}
							} catch (error) {
								console.error('移除成员失败:', error);
								uni.showToast({ title: '移除失败', icon: 'error' });
							}
						}
					}
				});
			},
			
			// 打开编辑组织页面
			openEditGroup() {
				uni.navigateTo({
					url: `/pages/device/edit?id=${this.id}`
				});
			},
			
			// 格式化时间
			formatTime(timestamp) {
				if (!timestamp) return '';
				try {
					const date = new Date(timestamp);
					return date.toLocaleDateString('zh-CN');
				} catch (e) {
					return timestamp;
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.info-item {
		display: flex;
		align-items: center;
		margin: 10rpx 0;
		
		.info-label {
			font-weight: bold;
			color: #333;
			margin-right: 20rpx;
			min-width: 140rpx;
		}
		
		.info-value {
			color: #666;
		}
	}
	
	.member-actions {
		margin-top: 10rpx;
		
		.delete-btn {
			background: #ff3b30;
			color: white;
			border: none;
			padding: 10rpx 30rpx;
			border-radius: 6rpx;
			font-size: 24rpx;
			
			&:active {
				background: #ff5e54;
			}
		}
	}
	
	.empty {
		padding: 60rpx 0;
		text-align: center;
		
		text {
			color: #999;
			font-size: 32rpx;
		}
		
		.scan-btn {
			margin-top: 40rpx;
			padding: 20rpx 40rpx;
			background: #007aff;
			border-radius: 50rpx;
			display: inline-block;
			
			text {
				color: white;
				font-size: 28rpx;
			}
		}
	}
</style>