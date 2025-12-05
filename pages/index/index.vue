<template>
	<view class="container">
		<uni-card title="平台管理" extra="限管理员">
			<uni-list :border="false">
				<uni-list-item title="所有设备" clickable show-arrow link="navigateTo" to="/pages/admin/device"></uni-list-item>
				<uni-list-item title="所有组织" clickable show-arrow link="navigateTo" to="/pages/admin/group"></uni-list-item>
				<uni-list-item title="所有用户" clickable show-arrow link="navigateTo" to="/pages/admin/user"></uni-list-item>
			</uni-list>
		</uni-card>

		<uni-card title="组织管理" extra="我的组织">
			<uni-list :border="false">
				<uni-list-item title="组织详情" clickable show-arrow link="navigateTo" to="/pages/admin/group_detail"></uni-list-item>
				<uni-list-item title="切换组织" clickable show-arrow @click="switchGroup" :extra-icon="{type:'redo'}"></uni-list-item>
			</uni-list>
		</uni-card>
	</view>
</template>

<script>
	import { userStore } from '../../store';
	
	export default {
		data() {
			return {
			}
		},
		mounted() {
			//TODO 加载
			// uni.reLaunch({
			// 	url: "/pages/device/device"
			// })
		},
		methods: {
			// 切换组织
			async switchGroup() {
				const store = userStore();
				
				// 显示加载中
				uni.showLoading({
					title: '切换组织中...',
					mask: true
				});
				
				try {
					// 强制重新获取组织信息
					await store.getGroup();
					
					uni.hideLoading();
					
					if (store.group) {
						uni.showToast({
							title: `已切换到: ${store.group.name}`,
							icon: 'success'
						});
						
						// 可以跳转到设备页面或刷新当前页面
						setTimeout(() => {
							uni.reLaunch({
								url: "/pages/device/device"
							});
						}, 1500);
					} else {
						uni.showToast({
							title: '您没有可用的组织',
							icon: 'none'
						});
					}
				} catch (error) {
					uni.hideLoading();
					console.error('切换组织失败:', error);
					uni.showToast({
						title: '切换失败',
						icon: 'error'
					});
				}
			}
		}
	}
</script>

<style scoped>
	.container {
		padding: 20rpx;
	}
</style>