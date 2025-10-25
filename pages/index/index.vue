<template>
	<view class="container">


		<uni-card title="平台管理" extra="限管理员">
			<uni-list :border="false">
				<uni-list-item title="所有设备" clickable show-arrow link="navigateTo" to="/pages/admin/device"></uni-list-item>
				<uni-list-item title="所有组织" clickable show-arrow link="navigateTo" to="/pages/admin/group"></uni-list-item>
				<uni-list-item title="所有用户" clickable show-arrow link="navigateTo" to="/pages/admin/user"></uni-list-item>
			</uni-list>
		</uni-card>

	</view>

</template>

<script>
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
		}
	}
</script>

<style scoped>
	
</style>