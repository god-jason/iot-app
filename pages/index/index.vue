<template>
	<view class="page">
		<uni-card title="平台管理" extra="限管理员" v-if="user && user.admin">
			<uni-list :border="false">
				<uni-list-item title="所有设备" clickable show-arrow show-extra-icon link="navigateTo" to="/sub/admin/device"
					:extra-icon="{color:'#000', size:'28', type:'settings'}"></uni-list-item>
				<uni-list-item title="所有组织" clickable show-arrow show-extra-icon link="navigateTo" to="/sub/group/group"
					:extra-icon="{color:'#000', size:'28', type:'staff'}"></uni-list-item>
				<uni-list-item title="所有用户" clickable show-arrow show-extra-icon link="navigateTo" to="/sub/admin/user"
					:extra-icon="{color:'#000', size:'28', type:'person'}"></uni-list-item>
				<!-- <uni-list-item title="所有经销商" clickable show-arrow link="navigateTo" to="/admin/agent"
					show-extra-icon :extra-icon="{color:'#000', size:'28', type:'shop'}"></uni-list-item> -->
				<uni-list-item title="扫码设备" clickable @click="scanDevice"
					show-extra-icon :extra-icon="{color:'#000', size:'28', type:'scan'}"></uni-list-item>
			</uni-list>
		</uni-card>

		<uni-card title="组织管理" extra="我的组织" v-if="group">
			<uni-list :border="false">
				<uni-list-item title="组织详情" clickable show-arrow show-extra-icon link="navigateTo" to="/sub/group/detail"
					:extra-icon="{color:'#000', size:'28', type:'info'}"></uni-list-item>
				<uni-list-item title="成员管理" clickable show-arrow show-extra-icon link="navigateTo" to="/sub/group/members"
					:extra-icon="{color:'#000', size:'28', type:'contact'}"></uni-list-item>
				<uni-list-item title="批量解绑" clickable show-arrow @click="batchUnbind"
					show-extra-icon :extra-icon="{color:'#000', size:'28', type:'undo'}"></uni-list-item>
			</uni-list>
		</uni-card>
		
		
	</view>
</template>

<script>
	import {
		mapState
	} from 'pinia';
	import {
		userStore
	} from '../../store';
	import {
		post
	} from '../../utils/request';
	export default {
		data() {
			return {
			}
		},
		computed: {
			...mapState(userStore, ['user', 'group']),
		},
		mounted() {
			//TODO 加载
			// uni.reLaunch({
			// 	url: "/pages/device/device"
			// })
		},
		methods: {
			scanDevice(){
				uni.scanCode({
					success: (res) => {
						uni.navigateTo({
							url: "/pages/device/detail?id=" + res.result
						})
					}
				})
			},
			
			// 批量解绑
			batchUnbind() {
				uni.navigateTo({
					url: "/pages/device/select",
					events: {
						devices: async (devices) => {
							if (!devices || devices.length === 0) {
								return;
							}
							
							uni.showLoading({
								title: '解绑中...'
							});
							
							let successCount = 0;
							let failCount = 0;
							
							for (let index = 0; index < devices.length; index++) {
								const id = devices[index];
								try {
									const res = await post(`table/device/update/${id}`, {
										group_id: ''
									});
									
									if (res && (res.data === 0 || res.data > 0 || res.code === 0)) {
										successCount++;
									} else {
										failCount++;
									}
								} catch (error) {
									console.error(`解绑设备 ${id} 失败:`, error);
									failCount++;
								}
							}
							
							uni.hideLoading();
							
							// 触发设备列表更新
							uni.$emit('device-unbound');
							
							// 显示结果
							if (failCount === 0) {
								uni.showToast({
									title: `成功解绑 ${successCount} 个设备`,
									icon: 'success'
								});
							} else {
								uni.showToast({
									title: `成功 ${successCount} 个，失败 ${failCount} 个`,
									icon: 'none',
									duration: 2000
								});
							}
						}
					}
				});
			}
		}
	}
</script>

<style scoped>
	.container {
		padding: 20rpx;
	}
</style>