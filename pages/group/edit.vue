<template>
	<view class="page">
		<uni-card>
			<uni-forms ref="form" :modelValue="formData" :rules="rules" :label-width="100">
				<uni-forms-item label="名称" required name="name">
					<uni-easyinput v-model="formData.name" placeholder="请输入组织名称" />
				</uni-forms-item>
			</uni-forms>

			<view class="button-group">
				<button type="primary" @click="submit" :loading="loading">保存修改</button>
			</view>
		</uni-card>
	</view>
</template>

<script>
	import { get, post } from '../../utils/request';
	import { userStore } from '../../store';

	const store = userStore();

	export default {
		data() {
			return {
				id: '',
				formData: {
					name: '',
					disabled: false
				},
				rules: {
					name: {
						rules: [{
							required: true,
							errorMessage: '组织名称不能为空'
						}]
					}
				},
				loading: false
			}
		},
		onLoad(options) {
			this.id = options.id || (store.group && store.group.id ? store.group.id : '');
			if (this.id) this.loadGroupDetail();
		},
		methods: {
			
			async loadGroupDetail() {
				try {
					const res = await get(`table/group/detail/${this.id}`);
					const data = res.data || {};
					this.formData.name = data.name || '';
					this.formData.disabled = !!data.disabled;
				} catch (error) {
					console.error('加载组织详情失败:', error);
					uni.showToast({ title: '加载组织信息失败', icon: 'error' });
				}
			},
			async submit() {
				this.$refs.form.validate().then(async (valid) => {
					if (!valid) return;

					this.loading = true;
					try {
						const submitData = {
							name: this.formData.name,
							disabled: this.formData.disabled
						};

						const res = await post(`table/group/update/${this.id}`, submitData);
						if (res.data === 0 || res.data > 0 || res.code === 0) {
							uni.showToast({ title: '修改成功', icon: 'success' });
							uni.$emit('group-updated', this.id);
							setTimeout(() => uni.navigateBack(), 1500);
						} else {
							uni.showToast({ title: res.message || '修改失败', icon: 'error' });
						}
					} catch (error) {
						console.error('修改组织失败:', error);
						uni.showToast({ title: '操作失败', icon: 'error' });
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
</style>




