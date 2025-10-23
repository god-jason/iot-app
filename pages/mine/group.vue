<template>
	<view>

		<uni-card title="南京真格智能科技有限公司">
			<uni-list :border="false">
				<uni-list-item title="角色权限" rightText="超级管理员"></uni-list-item>
				<uni-list-item title="成员管理" clickable show-arrow></uni-list-item>
			</uni-list>
			<view class="buttons">
				<button type="primary" size="mini">切换</button>
			</view>
		</uni-card>

		<uni-card title="南京本易物联网有限公司">
			<uni-list :border="false">
				<uni-list-item title="角色权限" rightText="管理员"></uni-list-item>
				<uni-list-item title="成员管理" clickable show-arrow></uni-list-item>
			</uni-list>
			<view class="buttons">
				<button type="warn" size="mini">退出</button>
				<button type="primary" size="mini">切换</button>
			</view>
		</uni-card>

		<uni-card title="南京黑白科技有限公司">
			<uni-list :border="false">
				<uni-list-item title="角色权限" rightText="观察员"></uni-list-item>
			</uni-list>
			<view class="buttons">
				<button type="warn" size="mini">退出</button>
				<button type="primary" size="mini">切换</button>
			</view>
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

<style lang="scss" scoped>
	.buttons {
		//display: flex;
		//align-items: end;
		//justify-content: end;
		text-align: right;
		button{
			margin: 0 10rpx;
		}
	}
</style>