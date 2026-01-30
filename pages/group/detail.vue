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
					title="成员管理"
					show-arrow
					clickable
					@click="openMembers"
					:extra-icon="{type:'person'}">
				</uni-list-item>
			</uni-list>
		</uni-card>
	</view>
</template>

<script>
	import { get } from '../../utils/request';
	import { userStore } from '../../store';

	const store = userStore();

	export default {
		data() {
			return {
				id: '',
				group: {},
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
				} catch (error) {
					console.error('加载组织详情失败:', error);
				}
			},

			openMembers() {
				uni.navigateTo({
					url: `/pages/group/members?group_id=${this.id}`
				});
			},

			openEditGroup() {
				uni.navigateTo({
					url: `/pages/group/edit?id=${this.id}`
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
</style>




