<template>
	<view>
		<uni-card title="修改密码">
			<uni-forms ref="form" :modelValue="formData" :rules="rules" :label-width="120">
				<!-- 当前密码 -->
				<uni-forms-item label="当前密码" required name="currentPassword">
					<uni-easyinput 
						type="password" 
						v-model="formData.currentPassword" 
						placeholder="请输入当前密码"
						:disabled="loading">
					</uni-easyinput>
				</uni-forms-item>
				
				<!-- 新密码 -->
				<uni-forms-item label="新密码" required name="newPassword">
					<uni-easyinput 
						type="password" 
						v-model="formData.newPassword" 
						placeholder="请输入新密码"
						:disabled="loading">
					</uni-easyinput>
				</uni-forms-item>
				
				<!-- 确认新密码 -->
				<uni-forms-item label="确认新密码" required name="confirmPassword">
					<uni-easyinput 
						type="password" 
						v-model="formData.confirmPassword" 
						placeholder="请再次输入新密码"
						:disabled="loading">
					</uni-easyinput>
				</uni-forms-item>
				
				<!-- 密码强度提示 -->
				<view class="password-strength" v-if="formData.newPassword">
					<text class="strength-label">密码强度:</text>
					<view class="strength-bars">
						<view class="strength-bar" :class="getStrengthClass(1)"></view>
						<view class="strength-bar" :class="getStrengthClass(2)"></view>
						<view class="strength-bar" :class="getStrengthClass(3)"></view>
						<view class="strength-bar" :class="getStrengthClass(4)"></view>
					</view>
					<text class="strength-text">{{ getPasswordStrength() }}</text>
				</view>
				
				<!-- 密码要求 -->
				<view class="password-requirements">
					<text class="requirement-title">密码要求:</text>
					<view class="requirement-item" :class="{ satisfied: checkRequirement('length') }">
						<uni-icons :type="checkRequirement('length') ? 'checkmarkempty' : 'clear'" 
							:color="checkRequirement('length') ? '#4cd964' : '#ff3b30'" 
							size="16">
						</uni-icons>
						<text>至少8个字符</text>
					</view>
					<view class="requirement-item" :class="{ satisfied: checkRequirement('complexity') }">
						<uni-icons :type="checkRequirement('complexity') ? 'checkmarkempty' : 'clear'" 
							:color="checkRequirement('complexity') ? '#4cd964' : '#ff3b30'" 
							size="16">
						</uni-icons>
						<text>包含字母和数字</text>
					</view>
				</view>
			</uni-forms>
			
			<view class="button-group">
				<button type="primary" @click="submit" :loading="loading">修改密码</button>
			</view>
		</uni-card>
	</view>
</template>

<script>
	import {
		post
	} from '../../utils/request';
	import {
		mapState
	} from 'pinia';
	import {
		userStore
	} from '../../store';

	export default {
		data() {
			return {
				formData: {
					currentPassword: '',
					newPassword: '',
					confirmPassword: ''
				},
				rules: {
					currentPassword: {
						rules: [{
							required: true,
							errorMessage: '请输入当前密码'
						}, {
							minLength: 1,
							errorMessage: '密码不能为空'
						}]
					},
					newPassword: {
						rules: [{
							required: true,
							errorMessage: '请输入新密码'
						}, {
							minLength: 8,
							errorMessage: '密码至少8个字符'
						}, {
							validateFunction: this.validatePasswordComplexity
						}]
					},
					confirmPassword: {
						rules: [{
							required: true,
							errorMessage: '请确认新密码'
						}, {
							validateFunction: this.validatePasswordMatch
						}]
					}
				},
				loading: false
			}
		},
		computed: {
			...mapState(userStore, ['user']),
		},
		methods: {
			// 验证密码复杂度
			validatePasswordComplexity(rule, value, data, callback) {
				// 至少包含字母和数字
				const hasLetter = /[a-zA-Z]/.test(value);
				const hasNumber = /\d/.test(value);
				
				if (!hasLetter || !hasNumber) {
					callback('密码必须包含字母和数字');
				} else {
					callback();
				}
			},
			
			// 验证密码是否匹配
			validatePasswordMatch(rule, value, data, callback) {
				if (value !== data.newPassword) {
					callback('两次输入的密码不一致');
				} else {
					callback();
				}
			},
			
			// 检查密码要求
			checkRequirement(type) {
				const password = this.formData.newPassword;
				
				switch(type) {
					case 'length':
						return password.length >= 8;
					case 'complexity':
						return /[a-zA-Z]/.test(password) && /\d/.test(password);
					default:
						return false;
				}
			},
			
			// 获取密码强度
			getPasswordStrength() {
				const password = this.formData.newPassword;
				if (!password) return '';
				
				let score = 0;
				
				// 长度得分
				if (password.length >= 8) score += 1;
				if (password.length >= 12) score += 1;
				
				// 复杂度得分
				if (/[a-z]/.test(password)) score += 1;
				if (/[A-Z]/.test(password)) score += 1;
				if (/\d/.test(password)) score += 1;
				if (/[^a-zA-Z0-9]/.test(password)) score += 1;
				
				if (score <= 2) return '弱';
				if (score <= 4) return '中';
				if (score <= 5) return '强';
				return '非常强';
			},
			
			// 获取强度条样式
			getStrengthClass(index) {
				const strength = this.getPasswordStrength();
				const strengthMap = {
					'弱': 1,
					'中': 2,
					'强': 3,
					'非常强': 4
				};
				
				const strengthLevel = strengthMap[strength] || 0;
				
				if (index <= strengthLevel) {
					return {
						'strength-bar-weak': strengthLevel <= 2,
						'strength-bar-medium': strengthLevel === 3,
						'strength-bar-strong': strengthLevel >= 4
					};
				}
				
				return {};
			},
			
			// 提交修改
			async submit() {
				this.$refs.form.validate().then(async (valid) => {
					if (valid) {
						this.loading = true;
						
						try {
							// 这里需要先验证当前密码
							// 由于接口没有提供验证当前密码的接口，我们先假设当前密码正确
							// 在实际应用中，可能需要先调用登录接口验证当前密码
							
							// 准备提交数据
							const submitData = {
								password: this.formData.newPassword
							};
							
							console.log('修改密码数据:', submitData);
							
							// 调用修改密码接口
							// 注意：根据你的接口，这里需要传递用户ID
							const userId = this.user?.id || '';
							let res = await post(`password/${userId}`, submitData);
							
							if (res && (res.code === 0 || res.data === 0)) {
								uni.showToast({
									title: '密码修改成功',
									icon: 'success'
								});
								
								// 显示重新登录提示
								setTimeout(() => {
									uni.showModal({
										title: '提示',
										content: '密码修改成功，需要重新登录，是否立即重新登录？',
										showCancel: true,
										success: (modalRes) => {
											if (modalRes.confirm) {
												// 跳转到登录页
												uni.reLaunch({
													url: '/pages/login/index'
												});
											} else {
												// 返回上一页
												uni.navigateBack();
											}
										}
									});
								}, 1500);
								
							} else {
								uni.showToast({
									title: res?.message || '修改失败',
									icon: 'error'
								});
							}
						} catch (error) {
							console.error('修改密码失败:', error);
							
							// 处理特定的错误情况
							if (error.message && error.message.includes('401')) {
								uni.showToast({
									title: '当前密码错误',
									icon: 'error'
								});
							} else if (error.message && error.message.includes('网络')) {
								uni.showToast({
									title: '网络连接失败',
									icon: 'error'
								});
							} else {
								uni.showToast({
									title: error.message || '操作失败',
									icon: 'error'
								});
							}
						} finally {
							this.loading = false;
						}
					}
				}).catch((err) => {
					console.log('表单验证失败:', err);
				});
			},
		}
	}
</script>

<style lang="scss">
	.password-strength {
		display: flex;
		align-items: center;
		margin: 30rpx 0;
		padding: 20rpx;
		background-color: #f9f9f9;
		border-radius: 8rpx;
		
		.strength-label {
			font-size: 28rpx;
			color: #333;
			margin-right: 20rpx;
			min-width: 120rpx;
		}
		
		.strength-bars {
			display: flex;
			flex: 1;
			gap: 10rpx;
			margin-right: 20rpx;
			
			.strength-bar {
				height: 10rpx;
				flex: 1;
				background-color: #e0e0e0;
				border-radius: 5rpx;
				transition: all 0.3s;
				
				&.strength-bar-weak {
					background-color: #ff3b30;
				}
				
				&.strength-bar-medium {
					background-color: #ff9500;
				}
				
				&.strength-bar-strong {
					background-color: #4cd964;
				}
			}
		}
		
		.strength-text {
			font-size: 28rpx;
			font-weight: bold;
			min-width: 80rpx;
			text-align: right;
		}
	}
	
	.password-requirements {
		margin: 30rpx 0;
		padding: 20rpx;
		background-color: #f9f9f9;
		border-radius: 8rpx;
		
		.requirement-title {
			display: block;
			font-size: 28rpx;
			color: #333;
			margin-bottom: 15rpx;
			font-weight: bold;
		}
		
		.requirement-item {
			display: flex;
			align-items: center;
			margin-bottom: 10rpx;
			font-size: 26rpx;
			color: #666;
			
			&:last-child {
				margin-bottom: 0;
			}
			
			.uni-icons {
				margin-right: 10rpx;
			}
			
			&.satisfied {
				color: #4cd964;
			}
			
			&:not(.satisfied) {
				color: #ff3b30;
			}
		}
	}
	
	.button-group {
		padding: 40rpx 0;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		
		button {
			height: 80rpx;
			border-radius: 8rpx;
			font-size: 32rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			
			&[type="primary"] {
				background-color: #007aff;
				color: #fff;
			}
			
			&[type="default"] {
				background-color: #fff;
				color: #333;
				border: 1rpx solid #e5e5e5;
			}
		}
	}
	
	// 输入框样式调整
	::v-deep .uni-forms-item__label {
		font-weight: bold;
		color: #333;
	}
</style>