<template>
	<view class="page">
		<uni-card>
			<uni-forms ref="form" :modelValue="formData" :rules="rules" :label-width="100">
				<uni-forms-item label="充值金额" required name="amount">
					<uni-easyinput 
						type="number" 
						v-model="formData.amount" 
						placeholder="请输入充值金额" 
						:disabled="loading" />
				</uni-forms-item>
			</uni-forms>

			<view class="button-group">
				<button type="primary" @click="submit" :loading="loading">确认充值</button>
			</view>
		</uni-card>

		<!-- 快捷金额 -->
		<uni-card title="快捷充值">
			<view class="quick-amounts">
				<view 
					v-for="amount in quickAmounts" 
					:key="amount" 
					class="quick-amount-item"
					@click="selectQuickAmount(amount)">
					¥{{ amount }}
				</view>
			</view>
		</uni-card>
	</view>
</template>

<script>
	import { post } from '../../utils/request';

	export default {
		data() {
			return {
				formData: {
					amount: ''
				},
				rules: {
					amount: {
						rules: [{
							required: true,
							errorMessage: '请输入充值金额'
						}, {
							validateFunction: (rule, value, data, callback) => {
								const amount = parseFloat(value);
								if (isNaN(amount) || amount <= 0) {
									callback('充值金额必须大于0');
								} else if (amount > 100000) {
									callback('单次充值金额不能超过100000元');
								} else {
									return true;
								}
							}
						}]
					}
				},
				loading: false,
				quickAmounts: [50, 100, 200, 500, 1000, 2000]
			}
		},
		methods: {
			// 选择快捷金额
			selectQuickAmount(amount) {
				this.formData.amount = amount.toString();
			},
			
			// 提交充值
			async submit() {
				this.$refs.form.validate().then(async (valid) => {
					if (!valid) return;

					this.loading = true;
					try {
						const amount = parseFloat(this.formData.amount);
						const res = await post('wallet/recharge', {
							amount: amount
						});
						
						if (res && (res.code === 0 || res.data !== undefined)) {
							uni.showToast({
								title: '充值成功',
								icon: 'success'
							});
							
							// 触发钱包页面刷新
							uni.$emit('wallet-updated');
							
							setTimeout(() => {
								uni.navigateBack();
							}, 1500);
						} else {
							uni.showToast({
								title: res.message || '充值失败',
								icon: 'error'
							});
						}
					} catch (error) {
						console.error('充值失败:', error);
						uni.showToast({
							title: '充值失败',
							icon: 'error'
						});
					} finally {
						this.loading = false;
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.button-group {
		padding: 40rpx 30rpx;
		
		button {
			height: 80rpx;
			border-radius: 8rpx;
			font-size: 32rpx;
			background-color: #007aff;
			color: #fff;
		}
	}
	
	.uni-card {
		margin: 20rpx 30rpx;
		margin-top: 40rpx;
		
		.uni-forms-item {
			padding: 20rpx 0;
			border-bottom: 1rpx solid #f5f5f5;
			
			&:last-child {
				border-bottom: none;
			}
		}
	}
	
	.quick-amounts {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
		padding: 20rpx 0;
		
		.quick-amount-item {
			flex: 0 0 calc(33.333% - 14rpx);
			text-align: center;
			padding: 30rpx 0;
			background-color: #f5f5f5;
			border-radius: 8rpx;
			font-size: 32rpx;
			color: #333;
			
			&:active {
				background-color: #e0e0e0;
			}
		}
	}
</style>





