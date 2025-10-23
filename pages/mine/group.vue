<template>
	<view>
		
		<uni-card title="南京真格智能科技有限公司">
			<uni-list :border="false">
				<uni-list-item title="角色权限" rightText="超级管理员"></uni-list-item>
				<uni-list-item title="成员管理" clickable show-arrow></uni-list-item>
			</uni-list>
		</uni-card>
		
		<uni-card title="南京本易物联网有限公司">
			<uni-list :border="false">
				<uni-list-item title="角色权限" rightText="管理员"></uni-list-item>
				<uni-list-item title="加入时间" rightText="2025-10-12"></uni-list-item>
				<uni-list-item title="退出组织"></uni-list-item>
			</uni-list>
		</uni-card>
		
		<uni-card title="南京黑白科技有限公司">
			<uni-list :border="false">
				<uni-list-item title="角色权限" rightText="观察员"></uni-list-item>
				<uni-list-item title="加入时间" rightText="2025-10-12"></uni-list-item>
				<uni-list-item title="退出组织"></uni-list-item>
			</uni-list>
		</uni-card>
		
		<button type="default">创建组织</button>
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			
		}
	}
</script>

<style>

</style>
