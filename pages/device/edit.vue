<template>
	<view>
		<uni-card title="修改设备信息">
			<uni-forms ref="form" :modelValue="formData" :rules="rules" :label-width="100">
				<uni-forms-item label="设备名称" required name="name">
					<uni-easyinput v-model="formData.name" placeholder="请输入设备名称" />
				</uni-forms-item>

				<uni-forms-item label="设备描述" name="description">
					<uni-easyinput type="textarea" v-model="formData.description" placeholder="请输入设备描述" />
				</uni-forms-item>
			</uni-forms>
			
			<view class="button-group">
				<button type="primary" @click="submit" :loading="loading">保存修改</button>
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
				formData: {
					name: '',
					description: ''
				},
				rules: {
					name: {
						rules: [{
							required: true,
							errorMessage: '设备名称不能为空'
						}]
					}
				},
				loading: false
			}
		},
		onLoad(options) {
			this.id = options.id;
			if (this.id) {
				this.loadDeviceDetail();
			}
		},
		methods: {
			// 加载设备详情
			async loadDeviceDetail() {
				try {
					let res = await get(`table/device/detail/${this.id}`);
					if (res.data) {
						this.formData.name = res.data.name || '';
						this.formData.description = res.data.description || '';
					}
				} catch (error) {
					console.error('加载设备详情失败:', error);
					uni.showToast({
						title: '加载设备信息失败',
						icon: 'error'
					});
				}
			},
			
			// 提交修改
			async submit() {
				this.$refs.form.validate().then(async (valid) => {
					if (valid) {
						this.loading = true;
						
						try {
							// 提交数据
							const submitData = this.formData;
							console.log('提交数据:', submitData);
							
							let res = await post(`table/device/update/${this.id}`, submitData);
							console.log('接口响应:', res);
							
							// 根据实际响应结构判断成功
							// 如果返回 {data: 0} 表示成功（0可能是影响的行数）
							// 或者返回 {code: 0, data: ...}
							if (res) {
								if (res.data === 0 || res.data > 0 || res.code === 0) {
									uni.showToast({
										title: '修改成功',
										icon: 'success'
									});
									
									// 触发刷新事件
									uni.$emit('device-updated', this.id);
									
									setTimeout(() => {
										uni.navigateBack();
									}, 1500);
								} else if (res.message) {
									uni.showToast({
										title: res.message,
										icon: 'error'
									});
								} else {
									// 如果没有明确的错误信息，但data不是0，可能是部分成功
									uni.showToast({
										title: '修改完成',
										icon: 'success'
									});
									setTimeout(() => uni.navigateBack(), 1500);
								}
							} else {
								uni.showToast({
									title: '接口无响应',
									icon: 'error'
								});
							}
						} catch (error) {
							console.error('修改设备失败:', error);
							
							// 更详细的错误处理
							if (error.response) {
								// 服务器响应错误
								uni.showToast({
									title: `服务器错误: ${error.response.status}`,
									icon: 'error'
								});
							} else if (error.request) {
								// 请求未收到响应
								uni.showToast({
									title: '网络连接失败',
									icon: 'error'
								});
							} else {
								// 其他错误
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
			}
		}
	}
</script>

<style lang="scss">
	.button-group {
		padding: 40rpx 30rpx;
		
		button {
			height: 80rpx;
			border-radius: 8rpx;
			font-size: 32rpx;
			background-color: #007aff;
			color: #fff;
			display: flex;
			align-items: center;
			justify-content: center;
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