<template>
	<view>
		<uni-card title="个人信息">
			<uni-forms ref="form" :modelValue="formData" :rules="rules" :label-width="100">
				<uni-forms-item label="用户ID" required>
					<uni-easyinput v-model="formData.id" placeholder="用户ID" disabled />
				</uni-forms-item>

				<uni-forms-item label="用户名" name="name">
					<uni-easyinput v-model="formData.name" placeholder="请输入用户名" />
				</uni-forms-item>

				<uni-forms-item label="邮箱" name="email">
					<uni-easyinput v-model="formData.email" placeholder="请输入邮箱" />
				</uni-forms-item>

				<uni-forms-item label="手机号" name="cellphone">
					<uni-easyinput v-model="formData.cellphone" placeholder="请输入手机号" />
				</uni-forms-item>
			</uni-forms>
		</uni-card>

		<view class="action-buttons">
			<button type="primary" @click="submit" :loading="saving">保存</button>
		</view>
	</view>
</template>

<script>
	import {
		get,
		post
	} from '../../utils/request';
	import {
		userStore
	} from '../../store';

	export default {
		data() {
			return {
				formData: {
					id: '',
					name: '',
					email: '',
					cellphone: ''
				},
				originalData: {},
				rules: {
					name: {
						rules: [{
							required: false,
							errorMessage: '用户名不能为空'
						}]
					},
					email: {
						rules: [{
							format: 'email',
							errorMessage: '邮箱格式不正确'
						}]
					},
					cellphone: {
						rules: [{
							validateFunction: this.validatePhone,
							errorMessage: '手机号格式不正确'
						}]
					}
				},
				saving: false
			}
		},
		onLoad() {
			this.loadUserInfo();
		},
		methods: {
			// 加载用户信息 - 直接从store获取
			async loadUserInfo() {
				try {
					const store = userStore();

					// 确保用户信息已加载
					if (!store.user) {
						await store.getUser();
					}

					if (store.user) {
						this.formData = {
							id: store.user.id || '',
							name: store.user.name || '',
							email: store.user.email || '',
							cellphone: store.user.cellphone || ''
						};
						this.originalData = {
							...this.formData
						};
					} else {
						uni.showToast({
							title: '未获取到用户信息',
							icon: 'error'
						});
					}
				} catch (error) {
					console.error('加载用户信息失败:', error);
					uni.showToast({
						title: '加载用户信息失败',
						icon: 'error'
					});
				}
			},

			// 手机号验证
			validatePhone(rule, value, callback) {
				if (!value) return true;

				const reg = /^1[3-9]\d{9}$/;
				if (!reg.test(value)) {
					return false;
				}
				return true;
			},

			// 提交修改
			async submit() {
				this.$refs.form.validate().then(async (valid) => {
					if (valid) {
						this.saving = true;

						try {
							const updateData = {
								name: this.formData.name,
								email: this.formData.email,
								cellphone: this.formData.cellphone
							};

							// 调用更新接口
							const res = await post(`table/user/update/${this.formData.id}`, updateData);

							if (res.error) {
								uni.showToast({
									title: res.message || '保存失败',
									icon: 'error'
								});
								return
							}
							
							userStore().getUser();
							
							uni.showToast({
								title: '保存成功',
								icon: 'success'
							});

							setTimeout(() => {
								uni.navigateBack();
							}, 1500);
						} catch (error) {
							console.error('保存失败:', error);
							uni.showToast({
								title: '保存失败，请重试',
								icon: 'error'
							});
						} finally {
							this.saving = false;
						}
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.action-buttons {
		padding: 30rpx;

		button {
			height: 80rpx;
			border-radius: 8rpx;
			font-size: 32rpx;
			background-color: #007aff;
			color: white;
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

			::v-deep .uni-forms-item__label {
				font-weight: bold;
				color: #333;
			}
		}
	}
</style>