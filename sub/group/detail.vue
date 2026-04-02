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
			<view class="info-item" v-if="group.agent_id">
				<text class="info-label">代理商:</text>
				<text class="info-value">{{ agentName || '加载中...' }}</text>
			</view>
		</uni-card>
		
		<!-- 代理商管理 -->
		<uni-card v-if="group.agent_id" title="代理商管理">
			<view class="agent-info">
				<view class="info-item">
					<text class="info-label">代理商名称:</text>
					<text class="info-value">{{ agentName || '加载中...' }}</text>
				</view>
			</view>
			<view class="button-group">
				<button type="warn" @click="unbindAgent" :loading="unbinding">解绑代理商</button>
			</view>
		</uni-card>
		
		<uni-card v-else title="代理商管理">
			<view class="button-group">
				<button type="primary" @click="openBindAgent">绑定代理商</button>
			</view>
		</uni-card>

		<!-- 功能列表 -->
		<uni-card>
			<uni-list>
				<uni-list-item
					title="修改信息"
					show-arrow
					clickable
					@click="openEditGroup">
				</uni-list-item>

				<uni-list-item
					title="成员管理"
					show-arrow
					clickable
					@click="openMembers">
				</uni-list-item>
				
				<uni-list-item
					title="管理设备"
					show-arrow
					clickable
					@click="enter">
				</uni-list-item>

				<uni-list-item
					v-if="canTransfer"
					title="转移组织"
					show-arrow
					clickable
					@click="openTransfer">
				</uni-list-item>
			</uni-list>
		</uni-card>
	</view>
</template>

<script>
	import { get, post } from '../../utils/request';
	import { userStore } from '../../store';
	import { mapState } from 'pinia';

	const store = userStore();

	export default {
		data() {
			return {
				id: '',
				group: {},
				agentName: '',
				unbinding: false
			}
		},
		computed: {
			...mapState(userStore, ['user']),
			// 仅超级管理员或当前组织拥有者可以转移组织
			canTransfer() {
				if (!this.user || !this.group) return false;
				const isSuper = !!this.user.admin;
				const isOwner = !!this.group.user_id && this.group.user_id === this.user.id;
				return isSuper || isOwner;
			}
		},
		onShow() {
			if (this.id) this.load();
		},
		onLoad(options) {
			this.id = options.id || (store.group && store.group.id ? store.group.id : '');
			this.load();
		},
		methods: {
			async load() {
				await this.loadGroupDetail();
			},

			async loadGroupDetail() {
				try {
					const res = await get(`table/group/detail/${this.id}`);
					this.group = res.data || {};
					
					// 如果有 agent_id，加载代理商信息
					if (this.group.agent_id) {
						await this.loadAgentInfo();
					}
				} catch (error) {
					console.error('加载组织详情失败:', error);
				}
			},
			
			// 加载代理商信息（agent_id 存储的是 user_id）
			async loadAgentInfo() {
				if (!this.group.agent_id) return;
				
				try {
					const res = await get(`table/user/detail/${this.group.agent_id}`);
					if (res && res.data) {
						const user = res.data;
						this.agentName = user.name || user.nickname || user.username || user.cellphone || user.id || '未知';
					}
				} catch (error) {
					console.error('加载用户信息失败:', error);
					this.agentName = '加载失败';
				}
			},

			openMembers() {
				uni.navigateTo({
					url: `/sub/group/members?group_id=${this.id}`
				});
			},

			openEditGroup() {
				uni.navigateTo({
					url: `/sub/group/edit?id=${this.id}`
				});
			},

			openTransfer() {
				if (!this.canTransfer) {
					uni.showToast({
						title: '无权限操作',
						icon: 'error'
					});
					return;
				}
				uni.navigateTo({
					url: `/sub/group/transfer?group_id=${this.id}`
				});
			},

			formatTime(timestamp) {
				if (!timestamp) return '';
				try {
					const date = new Date(timestamp);
					return date.toLocaleDateString('zh-CN');
				} catch (e) {
					return timestamp;
				}
			},
			
			enter(){
				userStore().setGroup(this.group)
				
				uni.switchTab({
					url:"/pages/device/device"
				})
			},
			
			// 打开绑定代理商页面
			openBindAgent() {
				uni.navigateTo({
					url: `/sub/group/bind_agent?group_id=${this.id}`
				});
			},
			
			// 解绑代理商
			async unbindAgent() {
				uni.showModal({
					title: '确认解绑',
					content: `确定要解绑代理商 ${this.agentName || this.group.agent_id} 吗？`,
					success: async (res) => {
						if (res.confirm) {
							this.unbinding = true;
							
							try {
								const updateRes = await post(`table/group/update/${this.id}`, {
									agent_id: ''
								});
								
								if (updateRes && (updateRes.data === 0 || updateRes.data > 0 || updateRes.code === 0)) {
									uni.showToast({
										title: '解绑成功',
										icon: 'success'
									});
									
									// 重新加载组织详情
									await this.loadGroupDetail();
								} else {
									uni.showToast({
										title: updateRes.message || '解绑失败',
										icon: 'error'
									});
								}
							} catch (error) {
								console.error('解绑代理商失败:', error);
								uni.showToast({
									title: '解绑失败',
									icon: 'error'
								});
							} finally {
								this.unbinding = false;
							}
						}
					}
				});
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
	
	.agent-info {
		margin-bottom: 20rpx;
	}
	
	.button-group {
		padding: 20rpx 0;
		
		button {
			height: 80rpx;
			border-radius: 8rpx;
			font-size: 32rpx;
		}
	}
</style>



