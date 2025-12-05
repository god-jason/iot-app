<template>
	<view>
		<uni-card>
			<uni-forms ref="form" :modelValue="formData" :rules="rules" :label-width="100">
				<uni-forms-item label="名称" required name="name">
					<uni-easyinput v-model="formData.name" placeholder="请输入设备名称" />
				</uni-forms-item>

				<uni-forms-item label="描述" name="description">
					<uni-easyinput type="textarea" v-model="formData.description" placeholder="请输入设备描述" />
				</uni-forms-item>
				
				<uni-forms-item label="位置" name="location">
					<view class="location-section" @click="chooseLocation">
						<view v-if="formData.location" class="location-info">
							<text>{{ formData.location }}</text>
							<uni-icons type="location-filled" size="20" color="#007aff"></uni-icons>
						</view>
						<view v-else class="location-placeholder">
							<text>点击选择位置</text>
							<uni-icons type="location" size="20" color="#999"></uni-icons>
						</view>
					</view>
					
					<!-- 经纬度信息 -->
					<view v-if="formData.latitude && formData.longitude" class="coordinate-info">
						<text>经度: {{ formData.longitude }}</text>
						<text>纬度: {{ formData.latitude }}</text>
					</view>
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
	import { encodeBase32 } from 'geohashing';

	export default {
		data() {
			return {
				id: undefined,
				formData: {
					name: '',
					description: '',
					location: '',
					longitude: 0,
					latitude: 0
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
						this.formData.location = res.data.location || '';
						this.formData.longitude = res.data.longitude || 0;
						this.formData.latitude = res.data.latitude || 0;
					}
				} catch (error) {
					console.error('加载设备详情失败:', error);
					uni.showToast({
						title: '加载设备信息失败',
						icon: 'error'
					});
				}
			},
			
			// 选择位置
			async chooseLocation() {
				try {
					const location = await uni.chooseLocation({
						success: (res) => {
							this.formData.location = res.name;
							this.formData.longitude = res.longitude;
							this.formData.latitude = res.latitude;
						}
					});
				} catch (error) {
					if (error.errMsg && !error.errMsg.includes('cancel')) {
						uni.showToast({
							title: '获取位置失败',
							icon: 'error'
						});
					}
				}
			},
			
			// 计算geohash
			calculateGeohash() {
				const { latitude, longitude } = this.formData;
				if (latitude && longitude) {
					try {
						return encodeBase32(latitude, longitude);
					} catch (error) {
						console.error('计算geohash失败:', error);
						return '';
					}
				}
				return '';
			},
			
			// 提交修改
			async submit() {
				this.$refs.form.validate().then(async (valid) => {
					if (valid) {
						this.loading = true;
						
						try {
							// 准备提交数据
							const submitData = {
								name: this.formData.name,
								description: this.formData.description,
								location: this.formData.location,
								longitude: this.formData.longitude || 0,
								latitude: this.formData.latitude || 0,
								geo_code: this.calculateGeohash()
							};
							
							// 移除空值
							Object.keys(submitData).forEach(key => {
								if (submitData[key] === '' || submitData[key] === null) {
									delete submitData[key];
								}
							});
							
							let res = await post(`table/device/update/${this.id}`, submitData);
							
							if (res.data === 0 || res.data > 0 || res.code === 0) {
								uni.showToast({
									title: '修改成功',
									icon: 'success'
								});
								
								uni.$emit('device-updated', this.id);
								setTimeout(() => uni.navigateBack(), 1500);
							} else {
								uni.showToast({
									title: res.message || '修改失败',
									icon: 'error'
								});
							}
						} catch (error) {
							console.error('修改设备失败:', error);
							uni.showToast({
								title: '操作失败',
								icon: 'error'
							});
						} finally {
							this.loading = false;
						}
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.location-section {
		padding: 20rpx;
		border: 1rpx solid #e5e5e5;
		border-radius: 8rpx;
		background-color: #fafafa;
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
		
		&:active {
			background-color: #f0f0f0;
		}
		
		.location-info {
			flex: 1;
			display: flex;
			justify-content: space-between;
			align-items: center;
			
			text {
				font-size: 28rpx;
				color: #333;
				margin-right: 20rpx;
			}
		}
		
		.location-placeholder {
			flex: 1;
			display: flex;
			justify-content: space-between;
			align-items: center;
			
			text {
				font-size: 28rpx;
				color: #999;
			}
		}
	}
	
	.coordinate-info {
		display: flex;
		flex-direction: column;
		gap: 10rpx;
		margin-top: 20rpx;
		
		text {
			font-size: 26rpx;
			color: #666;
		}
	}
	
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