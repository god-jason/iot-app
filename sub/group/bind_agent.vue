<template>
	<view class="page">
		<uni-card title="绑定代理商">
			<uni-forms :modelValue="formData" :label-width="100">
				<uni-forms-item label="手机号" required name="cellphone">
					<uni-easyinput v-model="formData.cellphone" placeholder="请输入用户手机号" />
				</uni-forms-item>
			</uni-forms>

			<view class="button-group">
				<button type="primary" :loading="searching" @click="searchUser">搜索用户</button>
			</view>
		</uni-card>

		<uni-card v-if="targetUser" title="用户信息">
			<view class="info-item">
				<text class="info-label">ID：</text>
				<text class="info-value">{{ targetUser.id || targetUser._id }}</text>
			</view>
			<view class="info-item" v-if="targetUser.name || targetUser.nickname || targetUser.username">
				<text class="info-label">姓名：</text>
				<text class="info-value">{{ formatUserName(targetUser) }}</text>
			</view>
			<view class="info-item" v-if="targetUser.cellphone">
				<text class="info-label">手机号：</text>
				<text class="info-value">{{ targetUser.cellphone }}</text>
			</view>

			<view class="button-group">
				<button type="primary" :loading="binding" @click="confirmBind">确认绑定</button>
			</view>
		</uni-card>
	</view>
</template>

<script>
	import { post } from '../../utils/request';

	export default {
		data() {
			return {
				group_id: '',
				formData: {
					cellphone: ''
				},
				searching: false,
				binding: false,
				targetUser: null
			}
		},
		onLoad(options) {
			this.group_id = options.group_id || '';
		},
		methods: {
			async searchUser() {
				const cellphone = (this.formData.cellphone || '').trim();
				if (!cellphone) {
					uni.showToast({
						title: '请输入手机号',
						icon: 'error'
					});
					return;
				}

				this.searching = true;
				this.targetUser = null;
				
				try {
					// 按手机号查询用户
					const userRes = await post('table/user/search', {
						filter: {
							cellphone: cellphone
						},
						skip: 0,
						limit: 1
					});

					if (!userRes || !userRes.data || userRes.data.length === 0) {
						uni.showToast({
							title: '未找到用户',
							icon: 'none'
						});
						return;
					}
					
					this.targetUser = userRes.data[0];
				} catch (error) {
					console.error('搜索用户失败:', error);
					uni.showToast({
						title: '搜索失败',
						icon: 'error'
					});
				} finally {
					this.searching = false;
				}
			},
			
			formatUserName(user) {
				if (!user) return '';
				return user.name || user.nickname || user.username || user.realname || '';
			},
			
			confirmBind() {
				if (!this.group_id || !this.targetUser || !this.targetUser.id) {
					uni.showToast({
						title: '参数错误',
						icon: 'error'
					});
					return;
				}

				const userName = this.formatUserName(this.targetUser) || (this.targetUser.cellphone || this.targetUser.id);

				uni.showModal({
					title: '确认绑定',
					content: `确定将组织绑定给用户：${userName} 吗？`,
					success: (res) => {
						if (res.confirm) {
							this.doBind();
						}
					}
				});
			},
			
			async doBind() {
				this.binding = true;
				try {
					const res = await post(`table/group/update/${this.group_id}`, {
						agent_id: this.targetUser.id
					});

					if (res && (res.data === 0 || res.data > 0 || res.code === 0)) {
						uni.showToast({
							title: '绑定成功',
							icon: 'success'
						});

						// 返回上一页
						setTimeout(() => {
							uni.navigateBack();
						}, 1500);
					} else {
						uni.showToast({
							title: res.message || '绑定失败',
							icon: 'error'
						});
					}
				} catch (error) {
					console.error('绑定代理商失败:', error);
					uni.showToast({
						title: '绑定失败',
						icon: 'error'
					});
				} finally {
					this.binding = false;
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.button-group {
		margin-top: 30rpx;

		button {
			height: 80rpx;
			border-radius: 8rpx;
			font-size: 32rpx;
		}
	}

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
</style>


