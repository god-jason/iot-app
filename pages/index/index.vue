<template>
	<view class="page">
		<uni-card title="平台管理" extra="限管理员" v-if="user && user.admin">
			<uni-list :border="false">
				<uni-list-item title="所有设备" clickable show-arrow link="navigateTo" to="/pages/admin/device"></uni-list-item>
				<uni-list-item title="所有组织" clickable show-arrow link="navigateTo" to="/pages/group/group"></uni-list-item>
				<uni-list-item title="所有用户" clickable show-arrow link="navigateTo" to="/pages/admin/user"></uni-list-item>
				<uni-list-item title="扫码设备" clickable @click="scanDevice"></uni-list-item>
			</uni-list>
		</uni-card>

		<uni-card title="组织管理" extra="我的组织" v-if="group">
			<uni-list :border="false">
				<uni-list-item title="组织详情" clickable show-arrow link="navigateTo" to="/pages/group/detail"></uni-list-item>
				<uni-list-item title="成员管理" clickable show-arrow link="navigateTo" to="/pages/group/members"></uni-list-item>
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
			}
		}
	}
</script>

<style scoped>
	.container {
		padding: 20rpx;
	}
</style>