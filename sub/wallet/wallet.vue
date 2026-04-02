<template>
	<view class="page">
		<!-- 余额卡片 -->
		<uni-card>
			<view class="balance-section">
				<text class="balance-label">账户余额</text>
				<text class="balance-amount">¥{{ balance.toFixed(2) }}</text>
			</view>
		</uni-card>

		<!-- 功能列表 -->
		<uni-card>
			<uni-list :border="false">
				<uni-list-item 
					title="充值" 
					clickable 
					show-arrow 
					show-extra-icon 
					@click="openRecharge"
					:extra-icon="{color:'#4cd964', size:'28', type:'plus'}">
				</uni-list-item>
				
				<uni-list-item 
					title="账单明细" 
					clickable 
					show-arrow 
					show-extra-icon 
					@click="openBill"
					:extra-icon="{color:'#007aff', size:'28', type:'list'}">
				</uni-list-item>
			</uni-list>
		</uni-card>
	</view>
</template>

<script>
	import { get } from '../../utils/request';
	import { mapState } from 'pinia';
	import { userStore } from '../../store';

	export default {
		data() {
			return {
				balance: 0,
				loading: false
			}
		},
		computed: {
			...mapState(userStore, ['user']),
		},
		onShow() {
			// 从充值页面返回时刷新余额
			this.loadBalance();
		},
		onLoad() {
			this.loadBalance();
			// 监听钱包更新事件
			uni.$on('wallet-updated', this.loadBalance);
		},
		onUnload() {
			// 移除事件监听
			uni.$off('wallet-updated', this.loadBalance);
		},
		methods: {
			// 加载余额
			async loadBalance() {
				try {
					this.loading = true;
					const res = await get('wallet/balance');
					if (res && res.data !== undefined) {
						this.balance = parseFloat(res.data) || 0;
					}
				} catch (error) {
					console.error('加载余额失败:', error);
					uni.showToast({
						title: '加载余额失败',
						icon: 'error'
					});
				} finally {
					this.loading = false;
				}
			},
			
			// 打开充值页面
			openRecharge() {
				uni.navigateTo({
					url: '/sub/wallet/recharge'
				});
			},
			
			// 打开账单页面
			openBill() {
				uni.navigateTo({
					url: '/sub/wallet/bill'
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.balance-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60rpx 0;
		
		.balance-label {
			font-size: 28rpx;
			color: #666;
			margin-bottom: 20rpx;
		}
		
		.balance-amount {
			font-size: 64rpx;
			font-weight: bold;
			color: #007aff;
		}
	}
	
	.uni-card {
		margin: 20rpx 30rpx;
		margin-top: 40rpx;
	}
</style>

