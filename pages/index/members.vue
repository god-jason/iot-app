<template>
	<view class="container">
		<uni-card v-if="group" :title="group.name || '当前组织'" :sub-title="group.id">
			<view class="info-item">
				<text class="label">创建者</text>
				<text class="value">{{ group.user_id || '-' }}</text>
			</view>
		</uni-card>

		<uni-card title="成员管理">
			<uni-list v-if="members.length">
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
			</view>

			<view class="action-row">
				<button type="primary" size="mini" @click="scanAndAddMember" :loading="scanning">扫码添加成员</button>
				<button size="mini" @click="loadMembers" :loading="loading">刷新列表</button>
			</view>
		</uni-card>
	</view>
</template>

<script>
import { get, post } from '../../utils/request';
import { userStore } from '../../store';

export default {
	data() {
		return {
			group: null,
			members: [],
			loading: false,
			scanning: false,
			errorStyle: { color: '#ff3b30' },
			normalStyle: { color: '#4cd964' }
		}
	},
	async onShow() {
		await this.init();
	},
	methods: {
		async init() {
			const ok = await this.ensureGroup();
			if (!ok) return;
			await this.loadMembers();
		},

		async ensureGroup() {
			const store = userStore();
			if (!store.group) {
				try {
					await store.getGroup();
				} catch (error) {
					uni.showToast({ title: '获取组织失败', icon: 'error' });
					return false;
				}
			}

			this.group = store.group;

			if (!this.group) {
				uni.showToast({ title: '暂无可管理的组织', icon: 'none' });
				return false;
			}

			return true;
		},

		async loadMembers() {
			if (!this.group) return;
			this.loading = true;
			try {
				const res = await post('table/member/search', {
					filter: { group_id: this.group.id },
					limit: 100
				});
				this.members = res.data || [];
			} catch (error) {
				console.error('加载成员失败:', error);
				uni.showToast({ title: '加载失败', icon: 'error' });
			} finally {
				this.loading = false;
			}
		},

		async scanAndAddMember() {
			if (!this.group) return;
			this.scanning = true;
			try {
				const scanResult = await uni.scanCode({
					scanType: ['qrCode'],
					onlyFromCamera: true
				});

				const userId = this.extractUserId(scanResult.result);
				if (!userId) {
					uni.showToast({ title: '未识别到用户ID', icon: 'none' });
					return;
				}

				if (this.members.some(m => m.user_id === userId)) {
					uni.showToast({ title: '用户已是成员', icon: 'none' });
					return;
				}

				const memberData = {
					group_id: this.group.id,
					user_id: userId,
					disabled: false
				};

				const res = await post('table/member/create', memberData);

				if (res.code === 0) {
					uni.showToast({ title: '添加成功', icon: 'success' });
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

		extractUserId(result) {
			if (!result) return '';
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

		async removeMember(member) {
			if (!this.group) return;
			uni.showModal({
				title: '移除成员',
				content: `确定要移除成员 ${member.user_id} 吗？`,
				success: async (res) => {
					if (res.confirm) {
						try {
							const resp = await get(`table/member/delete/${member.group_id}/${member.user_id}`);

							if (resp.code === 0 || resp.data === 0) {
								uni.showToast({ title: '移除成功', icon: 'success' });
								const index = this.members.findIndex(m =>
									m.group_id === member.group_id && m.user_id === member.user_id
								);
								if (index !== -1) {
									this.members.splice(index, 1);
								}
							} else {
								uni.showToast({ title: resp.message || '移除失败', icon: 'error' });
							}
						} catch (error) {
							console.error('移除成员失败:', error);
							uni.showToast({ title: '移除失败', icon: 'error' });
						}
					}
				}
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
		}
	}
}
</script>

<style scoped>
.container {
	padding: 20rpx;
}

.info-item {
	display: flex;
	justify-content: space-between;
	padding: 10rpx 0;
	color: #666;
}

.label {
	font-weight: 600;
	color: #333;
}

.member-actions {
	display: flex;
	justify-content: flex-end;
	padding: 10rpx 0;
}

.delete-btn {
	background: #ff4d4f;
	color: #fff;
	border: none;
	padding: 12rpx 24rpx;
	border-radius: 8rpx;
}

.empty {
	text-align: center;
	color: #999;
	padding: 20rpx 0 10rpx;
}

.action-row {
	display: flex;
	justify-content: space-between;
	gap: 20rpx;
	padding-top: 10rpx;
}
</style>


