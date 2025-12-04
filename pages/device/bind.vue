<template>
	<view>
		<!-- 绑定设备 -->
		<uni-card title="绑定设备">
			<uni-forms ref="form" :modelValue="formData" :rules="rules" :label-width="100">
				<uni-forms-item label="组织" required name="group_id">
					<picker mode="selector" :range="groups" range-key="name" :value="groupIndex" @change="onGroupChange">
						<view class="picker-content">
							<text>{{ groups[groupIndex]?.name || '请选择组织' }}</text>
							<uni-icons type="arrowright" size="16" color="#999"></uni-icons>
						</view>
					</picker>
				</uni-forms-item>
				
				<uni-forms-item label="SN号" required name="device_id">
					<uni-easyinput 
						v-model="formData.device_id" 
						placeholder="请输入设备SN号"  
						suffixIcon="scan" 
						@iconClick="scanCode"
						:disabled="loading">
						<template v-slot:right>
							<button type="default" size="mini" @click="scanCode">扫描</button>
						</template>
					</uni-easyinput>
				</uni-forms-item>
				
				<uni-forms-item label="设备名称" name="device_name">
					<uni-easyinput 
						v-model="formData.device_name" 
						placeholder="请输入设备名称（可选）"
						:disabled="loading">
					</uni-easyinput>
				</uni-forms-item>
			</uni-forms>
			
			<button type="primary" @click="bindDevice" :loading="loading">绑定设备</button>
		</uni-card>

		<!-- 已绑定设备列表 -->
		<uni-card title="已绑定设备" v-if="boundDevices.length > 0">
			<uni-list>
				<uni-list-item 
					v-for="(device, index) in boundDevices" 
					:key="device.id"
					:title="device.name || device.id"
					:note="formatDeviceNote(device)"
					:rightText="device.online ? '在线' : '离线'"
					:rightTextStyle="getDeviceStatusStyle(device)"
					show-extra-icon
					:extra-icon="{color:'#007aff', size:'20', type:'device'}"
					@click="showDeviceActions(device, index)">
				</uni-list-item>
			</uni-list>
		</uni-card>

		<!-- 空状态 -->
		<view v-if="!loading && boundDevices.length === 0 && hasLoaded" class="empty-state">
			<uni-icons type="device" size="80" color="#ccc"></uni-icons>
			<text class="empty-text">暂无已绑定设备</text>
			<text class="empty-tip">扫描或输入SN号绑定设备</text>
		</view>
		
		<!-- 加载状态 -->
		<view v-if="loading" class="loading-state">
			<uni-load-more status="loading" content="加载中..."></uni-load-more>
		</view>
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
				boundDevices: [],
				loading: false,
				hasLoaded: false,
				// 添加字段探测
				availableFields: []
			}
		},
		computed: {
			...mapState(userStore, ['user', 'group']),
		},
		onLoad() {
			this.loadGroups();
		},
		onShow() {
			// 页面显示时刷新列表
			if (this.formData.group_id) {
				this.loadBoundDevices();
			}
		},
		methods: {
			// 探测设备表字段
			async detectDeviceFields() {
				try {
					const testParams = {
						filter: {},
						skip: 0,
						limit: 1
					};
					
					let res = await post('table/device/search', testParams);
					
					if (res && res.data && res.data.length > 0) {
						this.availableFields = Object.keys(res.data[0]);
						console.log('设备表可用字段:', this.availableFields);
					}
				} catch (error) {
					console.log('设备字段探测失败:', error);
				}
			},
			
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
						
						// 加载设备列表
						if (this.formData.group_id) {
							this.loadBoundDevices();
						}
					}
				} catch (error) {
					console.error('加载组织列表失败:', error);
					// 使用模拟数据
					this.groups = [
						{ id: 'group_001', name: '南京真格智能科技有限公司' },
						{ id: 'group_002', name: '南京本易物联网有限公司' },
						{ id: 'group_003', name: '南京黑白科技有限公司' }
					];
					if (this.groups.length > 0) {
						this.formData.group_id = this.groups[0].id;
						this.loadBoundDevices();
					}
				}
			},
			
			// 加载已绑定设备
			async loadBoundDevices() {
				if (!this.formData.group_id) return;
				
				this.loading = true;
				try {
					// 如果没有字段信息，先探测
					if (this.availableFields.length === 0) {
						await this.detectDeviceFields();
					}
					
					// 构建查询参数
					const params = {
						filter: {
							group_id: this.formData.group_id
						},
						skip: 0,
						limit: 50
						// 先不排序，避免字段不存在错误
					};
					
					// 如果探测到排序字段，添加排序
					if (this.availableFields.includes('create_time')) {
						params.sort = { create_time: -1 };
					} else if (this.availableFields.includes('created_at')) {
						params.sort = { created_at: -1 };
					} else if (this.availableFields.includes('updatedAt')) {
						params.sort = { updatedAt: -1 };
					}
					
					// 构建查询字段
					const columns = [];
					if (this.availableFields.includes('id')) columns.push('id');
					if (this.availableFields.includes('name')) columns.push('name');
					if (this.availableFields.includes('online')) columns.push('online');
					if (this.availableFields.includes('product_id')) columns.push('product_id');
					if (this.availableFields.includes('location')) columns.push('location');
					if (this.availableFields.includes('group_id')) columns.push('group_id');
					
					if (columns.length > 0) {
						params.columns = columns;
					}
					
					console.log('设备查询参数:', params);
					
					let res = await post('table/device/search', params);
					
					if (res && res.data) {
						this.boundDevices = res.data;
						this.hasLoaded = true;
						console.log('已绑定设备:', this.boundDevices);
					}
				} catch (error) {
					console.error('加载已绑定设备失败:', error);
					
					// 尝试最简查询
					await this.trySimplestDeviceQuery();
				} finally {
					this.loading = false;
				}
			},
			
			// 尝试最简查询
			async trySimplestDeviceQuery() {
				try {
					const params = {
						filter: {
							group_id: this.formData.group_id
						},
						skip: 0,
						limit: 50
						// 不排序，不指定字段
					};
					
					let res = await post('table/device/search', params);
					
					if (res && res.data) {
						this.boundDevices = res.data;
						this.hasLoaded = true;
						
						// 更新可用字段
						if (res.data.length > 0) {
							this.availableFields = Object.keys(res.data[0]);
						}
					}
				} catch (error) {
					console.error('最简查询也失败:', error);
				}
			},
			
			// 组织选择变化
			onGroupChange(e) {
				const index = e.detail.value;
				this.groupIndex = index;
				if (this.groups[index]) {
					this.formData.group_id = this.groups[index].id;
					// 切换组织时重新加载设备
					this.loadBoundDevices();
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
								deviceId = url.searchParams.get('sn') || url.searchParams.get('device_id') || result;
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
			
			// 获取设备信息
			async getDeviceInfo(deviceId) {
				if (!deviceId) return;
				
				try {
					let res = await get(`table/device/detail/${deviceId}`);
					if (res && res.data) {
						// 如果设备已存在，填充名称
						this.formData.device_name = res.data.name || '';
						
						// 如果设备已绑定到其他组织
						if (res.data.group_id) {
							uni.showModal({
								title: '提示',
								content: `该设备已绑定到其他组织，是否要重新绑定到当前组织？`,
								success: (modalRes) => {
									if (modalRes.confirm) {
										// 用户确认重新绑定
									}
								}
							});
						}
					}
				} catch (error) {
					// 设备可能不存在，这是正常情况
					console.log('设备不存在或无法获取信息:', error);
				}
			},
			
			// 绑定设备
			async bindDevice() {
				// 表单验证
				this.$refs.form.validate().then(async (valid) => {
					if (valid) {
						this.loading = true;
						
						try {
							// 检查设备是否存在
							let deviceRes = await get(`table/device/detail/${this.formData.device_id}`).catch(() => ({ data: null }));
							
							let deviceData = {};
							
							if (deviceRes && deviceRes.data) {
								// 设备已存在，更新组织
								deviceData = {
									group_id: this.formData.group_id
								};
								
								if (this.formData.device_name) {
									deviceData.name = this.formData.device_name;
								}
								
								// 调用更新接口
								let updateRes = await post(`table/device/update/${this.formData.device_id}`, deviceData);
								
								if (updateRes && (updateRes.data === 0 || updateRes.data > 0 || updateRes.code === 0)) {
									uni.showToast({
										title: '绑定成功',
										icon: 'success'
									});
									
									// 调用 IoT 绑定接口
									await this.callIoTBind(this.formData.device_id, this.formData.group_id);
								}
							} else {
								// 设备不存在，创建新设备
								deviceData = {
									id: this.formData.device_id,
									name: this.formData.device_name || this.formData.device_id,
									group_id: this.formData.group_id,
									product_id: 'default', // 默认产品ID，根据实际情况调整
									online: false
									// 不包含不存在的 created 字段
								};
								
								// 调用创建接口
								let createRes = await post('table/device/create', deviceData);
								
								if (createRes && createRes.code === 0) {
									uni.showToast({
										title: '创建并绑定成功',
										icon: 'success'
									});
									
									// 调用 IoT 绑定接口
									await this.callIoTBind(this.formData.device_id, this.formData.group_id);
								}
							}
							
							// 清空表单
							this.formData.device_id = '';
							this.formData.device_name = '';
							
							// 刷新设备列表
							await this.loadBoundDevices();
							
							// 触发设备列表更新
							uni.$emit('device-bound', this.formData.group_id);
							
						} catch (error) {
							console.error('绑定设备失败:', error);
							uni.showToast({
								title: error.message || '绑定失败',
								icon: 'error'
							});
						} finally {
							this.loading = false;
						}
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
								
								if (updateRes && (updateRes.data === 0 || updateRes.data > 0 || updateRes.code === 0)) {
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
						switch(actionIndex) {
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
			
			// 修改设备名称
			editDeviceName(device, index) {
				uni.showModal({
					title: '修改设备名称',
					content: '请输入新的设备名称',
					editable: true,
					placeholderText: device.name || device.id,
					success: async (res) => {
						if (res.confirm && res.content) {
							try {
								let updateRes = await post(`table/device/update/${device.id}`, {
									name: res.content
								});
								
								if (updateRes && (updateRes.data === 0 || updateRes.data > 0 || updateRes.code === 0)) {
									uni.showToast({
										title: '修改成功',
										icon: 'success'
									});
									
									// 更新本地数据
									this.boundDevices[index].name = res.content;
									this.$forceUpdate();
								}
							} catch (error) {
								console.error('修改设备名称失败:', error);
								uni.showToast({
									title: '修改失败',
									icon: 'error'
								});
							}
						}
					}
				});
			},
			
			// 格式化设备备注
			formatDeviceNote(device) {
				const notes = [];
				if (device.id) notes.push(`SN: ${device.id}`);
				if (device.product_id) notes.push(`产品: ${device.product_id}`);
				if (device.location) notes.push(`位置: ${device.location}`);
				return notes.join(' | ');
			},
			
			// 获取设备状态样式
			getDeviceStatusStyle(device) {
				if (device.online) {
					return {
						color: '#4cd964',
						fontSize: '26rpx'
					};
				}
				return {
					color: '#999',
					fontSize: '26rpx'
				};
			}
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