<template>
	<view class="page">
		<uni-card :title="title">
			<view class="user-info" v-if="user">
				<image :src="getUserAvatar(user)" class="user-avatar" mode="aspectFill"></image>
				<view class="user-details">
					<text class="user-name">{{ formatUserName(user) }}</text>
					<text class="user-id">ID: {{ user.id || user._id }}</text>
				</view>
			</view>
			
			<uni-forms ref="form" :modelValue="formData" :rules="rules" :label-width="120">
				<!-- 新密码 -->
				<uni-forms-item label="新密码" required name="password">
					<uni-easyinput 
						type="password" 
						v-model="formData.password" 
						placeholder="请输入新密码"
						:disabled="loading">
					</uni-easyinput>
				</uni-forms-item>
				
				<!-- 确认新密码 -->
				<uni-forms-item label="确认密码" required name="confirmPassword">
					<uni-easyinput 
						type="password" 
						v-model="formData.confirmPassword" 
						placeholder="请再次输入新密码"
						:disabled="loading">
					</uni-easyinput>
				</uni-forms-item>
				
				<!-- 密码强度提示 -->
				<view class="password-strength" v-if="formData.password">
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
				<button type="primary" @click="submit" :loading="loading">重置密码</button>
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
				user: null,
				title: '重置密码',
				formData: {
					password: '',
					confirmPassword: ''
				},
				rules: {
					password: {
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
		onLoad(options) {
			this.id = options.id;
			if (this.id) {
				this.loadUserDetail();
				this.title = '重置用户密码';
			}
		},
		methods: {
			// 加载用户详情
			async loadUserDetail() {
				try {
					let res = await get(`table/user/detail/${this.id}`);
					if (res.data) {
						this.user = res.data;
					}
				} catch (error) {
					console.error('加载用户详情失败:', error);
					uni.showToast({
						title: '加载用户信息失败',
						icon: 'error'
					});
				}
			},
			
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
				if (value !== data.password) {
					callback('两次输入的密码不一致');
				} else {
					callback();
				}
			},
			
			// 检查密码要求
			checkRequirement(type) {
				const password = this.formData.password;
				
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
				const password = this.formData.password;
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
			
			// 获取用户头像
			getUserAvatar(user) {
				return user.avatar || '/static/avatar.jpg';
			},
			
			// 格式化用户名称
			formatUserName(user) {
				return user.name || user.username || user.nickname || user.realname || '未知用户';
			},
			
			// 提交重置密码
			async submit() {
				this.$refs.form.validate().then(async (valid) => {
					if (valid) {
						this.loading = true;
						
						try {
							// 准备提交数据
							const submitData = {
								password: this.formData.password
							};
							
							console.log('重置密码数据:', submitData);
							
							// 调用重置密码接口
							let res = await post(`password/${this.id}`, submitData);
							
							if (res && (res.code === 0 || res.data === 0)) {
								uni.showToast({
									title: '密码重置成功',
									icon: 'success'
								});
								
								// 返回上一页
								setTimeout(() => {
									uni.navigateBack();
								}, 1500);
								
							} else {
								uni.showToast({
									title: res?.message || '重置失败',
									icon: 'error'
								});
							}
						} catch (error) {
							console.error('重置密码失败:', error);
							
							if (error.message && error.message.includes('401')) {
								uni.showToast({
									title: '权限不足',
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
			
			// 取消
			cancel() {
				uni.showModal({
					title: '提示',
					content: '确定放弃重置密码吗？',
					success: (res) => {
						if (res.confirm) {
							uni.navigateBack();
						}
					}
				});
			}
		}
	}
</script>

<style lang="scss">
	.user-info {
		display: flex;
		align-items: center;
		margin-bottom: 40rpx;
		padding: 20rpx;
		background-color: #f9f9f9;
		border-radius: 12rpx;
		
		.user-avatar {
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
			margin-right: 30rpx;
		}
		
		.user-details {
			flex: 1;
			
			.user-name {
				display: block;
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
				margin-bottom: 10rpx;
			}
			
			.user-id {
				font-size: 28rpx;
				color: #666;
			}
		}
	}
	
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
	
	.warning-note {
		display: flex;
		align-items: flex-start;
		margin: 30rpx 0;
		padding: 20rpx;
		background-color: #fff8e6;
		border-radius: 8rpx;
		border-left: 6rpx solid #ff9500;
		
		.uni-icons {
			margin-right: 15rpx;
			flex-shrink: 0;
			margin-top: 4rpx;
		}
		
		.warning-text {
			font-size: 28rpx;
			color: #e6a23c;
			line-height: 1.5;
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