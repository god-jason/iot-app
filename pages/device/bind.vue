<template>
	<view>
		<!-- 绑定设备 -->
		<uni-card title="绑定设备">
			<uni-forms ref="form" :modelValue="formData" :rules="rules" :label-width="100">
				<uni-forms-item label="组织" required name="group_id">
					<picker mode="selector" :range="groups" range-key="name" :value="groupIndex"
						@change="onGroupChange">
						<view class="picker-content">
							<text>{{ groups[groupIndex]?.name || '请选择组织' }}</text>
							<uni-icons type="arrowright" size="16" color="#999"></uni-icons>
						</view>
					</picker>
				</uni-forms-item>

				<uni-forms-item label="SN号" required name="device_id">
					<uni-easyinput v-model="formData.device_id" placeholder="请输入设备SN号" suffixIcon="scan"
						@iconClick="scanCode" :disabled="loading">
					</uni-easyinput>
				</uni-forms-item>

				<uni-forms-item label="设备名称" name="device_name">
					<uni-easyinput v-model="formData.device_name" placeholder="请输入设备名称（可选）" :disabled="loading">
					</uni-easyinput>
				</uni-forms-item>
			</uni-forms>

			<button type="primary" @click="bindDevice" :loading="loading">绑定设备</button>
		</uni-card>

	</view>
</template>

<script>
	import {
		get,
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
					device_id: '',
					device_name: '',
					group_id: ''
				},
				rules: {
					group_id: {
						rules: [{
							required: true,
							errorMessage: '请选择组织'
						}]
					},
					device_id: {
						rules: [{
							required: true,
							errorMessage: '请输入或扫描设备SN号'
						}]
					}
				},
				groups: [],
				groupIndex: 0,
				hasLoaded: false
			}
		},
		computed: {
			...mapState(userStore, ['user', 'group']),
		},
		onLoad() {
			this.loadGroups();
		},
		onShow() {},
		methods: {

			// 加载组织列表
			async loadGroups() {
				try {
					let res = await post('table/group/search', {
						filter: {},
						skip: 0,
						limit: 100
						// 移除排序或使用存在的字段
					});

					if (res && res.data) {
						this.groups = res.data;

						// 如果有当前用户所在组织，默认选中
						if (this.group && this.group.id) {
							const index = this.groups.findIndex(g => g.id === this.group.id);
							if (index !== -1) {
								this.groupIndex = index;
								this.formData.group_id = this.group.id;
							} else if (this.groups.length > 0) {
								this.formData.group_id = this.groups[0].id;
							}
						} else if (this.groups.length > 0) {
							this.formData.group_id = this.groups[0].id;
						}
					}
				} catch (error) {
					console.error('加载组织列表失败:', error);
					// 使用模拟数据
					this.groups = [];
					if (this.groups.length > 0) {
						this.formData.group_id = this.groups[0].id;
						this.loadBoundDevices();
					}
				}
			},

			// 扫描二维码
			scanCode() {
				uni.scanCode({
					success: (res) => {
						console.log('扫描结果:', res);

						let deviceId = '';

						// 处理扫描结果
						if (res.result) {
							// 尝试从结果中提取SN号
							const result = res.result.trim();

							// 如果是URL，尝试提取参数
							if (result.startsWith('http')) {
								const url = new URL(result);
								deviceId = url.searchParams.get('sn') || url.searchParams.get('device_id') ||
									result;
							} else {
								// 直接使用结果
								deviceId = result;
							}

							// 移除可能的空白字符
							deviceId = deviceId.replace(/\s/g, '');

							this.formData.device_id = deviceId;

							uni.showToast({
								title: '扫描成功',
								icon: 'success'
							});

							// 扫描后自动获取设备信息
							this.getDeviceInfo(deviceId);
						}
					},
					fail: (err) => {
						console.error('扫描失败:', err);
						uni.showToast({
							title: '扫描失败，请手动输入',
							icon: 'error'
						});
					}
				});
			},

			// 绑定设备
			async bindDevice() {
				// 表单验证
				this.$refs.form.validate().then(async (valid) => {
					if (valid) {
						this.loading = true;

						let deviceId = this.formData.device_id
						let groupId = this.formData.group_id
						let res = await get(`iot/device/${deviceId}/bind/${groupId}`);

						uni.showToast({
							title: '绑定成功',
							icon: 'success'
						});
					}
				}).catch((err) => {
					console.log('表单验证失败:', err);
				});
			},

			// 调用 IoT 绑定接口
			async callIoTBind(deviceId, groupId) {
				try {
					let res = await get(`iot/device/${deviceId}/bind/${groupId}`);

					if (res && res.code === 0) {
						console.log('IoT绑定成功');
					} else {
						console.warn('IoT绑定接口返回非预期:', res);
					}
				} catch (error) {
					console.warn('IoT绑定接口调用失败:', error);
					// 这里不显示错误，因为数据库绑定已经成功
				}
			},

			// 解绑设备
			async unbindDevice(device, index) {
				uni.showModal({
					title: '确认解绑',
					content: `确定要解绑设备 ${device.name || device.id} 吗？`,
					success: async (res) => {
						if (res.confirm) {
							this.loading = true;

							try {
								// 更新设备，清空 group_id
								let updateRes = await post(`table/device/update/${device.id}`, {
									group_id: ''
								});

								if (updateRes && (updateRes.data === 0 || updateRes.data > 0 || updateRes
										.code === 0)) {
									// 调用 IoT 解绑接口
									await this.callIoTUnbind(device.id);

									uni.showToast({
										title: '解绑成功',
										icon: 'success'
									});

									// 从列表中移除
									this.boundDevices.splice(index, 1);

									// 触发设备列表更新
									uni.$emit('device-unbound', this.formData.group_id);
								}
							} catch (error) {
								console.error('解绑设备失败:', error);
								uni.showToast({
									title: '解绑失败',
									icon: 'error'
								});
							} finally {
								this.loading = false;
							}
						}
					}
				});
			},

			// 调用 IoT 解绑接口
			async callIoTUnbind(deviceId) {
				try {
					let res = await get(`iot/device/${deviceId}/unbind`);

					if (res && res.code === 0) {
						console.log('IoT解绑成功');
					} else {
						console.warn('IoT解绑接口返回非预期:', res);
					}
				} catch (error) {
					console.warn('IoT解绑接口调用失败:', error);
				}
			},

			// 显示设备操作菜单
			showDeviceActions(device, index) {
				const items = ['查看详情', '修改名称', '解绑设备'];

				uni.showActionSheet({
					itemList: items,
					success: (res) => {
						const actionIndex = res.tapIndex;
						switch (actionIndex) {
							case 0: // 查看详情
								this.openDeviceDetail(device);
								break;
							case 1: // 修改名称
								this.editDeviceName(device, index);
								break;
							case 2: // 解绑设备
								this.unbindDevice(device, index);
								break;
						}
					}
				});
			},

			// 打开设备详情
			openDeviceDetail(device) {
				uni.navigateTo({
					url: `/pages/device/detail?id=${device.id}`
				});
			},
		}
	}
</script>

<style lang="scss">
	.picker-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10rpx 20rpx;
		border: 1rpx solid #e5e5e5;
		border-radius: 8rpx;
		background-color: #fff;

		text {
			font-size: 28rpx;
			color: #333;
		}
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;

		.empty-text {
			font-size: 32rpx;
			color: #999;
			margin-top: 30rpx;
		}

		.empty-tip {
			font-size: 28rpx;
			color: #ccc;
			margin-top: 20rpx;
		}
	}

	.loading-state {
		padding: 40rpx 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	button[type="primary"] {
		margin-top: 20rpx;
		height: 80rpx;
		border-radius: 8rpx;
		font-size: 32rpx;
		background-color: #007aff;
		color: white;
	}
</style>