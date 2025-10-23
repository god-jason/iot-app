<template>
	<view>
		<view class="head">
			<image class="avatar" mode="aspectFill" :src="user.avatar"></image>
			<view class="nickname">
				{{user.nickname}}
			</view>
		</view>

		<uni-card>
			<uni-list :border="false">
				<uni-list-item title="修改个人信息" clickable show-arrow show-extra-icon
					:extra-icon="{color:'#000000', size:'24', type:'person'}"></uni-list-item>
				<uni-list-item title="扫码绑定设备" clickable show-arrow show-extra-icon
					:extra-icon="{color:'#000000', size:'24', type:'scan'}"></uni-list-item>
				<uni-list-item title="客户支持" clickable show-arrow show-extra-icon
					:extra-icon="{color:'#000000', size:'24', type:'phone'}"></uni-list-item>
				<uni-list-item title="意见反馈" clickable show-arrow show-extra-icon
					:extra-icon="{color:'#000000', size:'24', type:'star'}"></uni-list-item>
				<uni-list-item title="退出" clickable show-extra-icon
					:extra-icon="{color:'#000000', size:'24', type:'close'}"></uni-list-item>
			</uni-list>
		</uni-card>

		<uni-card title="平台管理" extra="限管理员">
			<uni-list :border="false">
				<uni-list-item title="所有设备" clickable show-arrow></uni-list-item>
				<uni-list-item title="所有客户" clickable show-arrow></uni-list-item>
				<uni-list-item title="所有用户" clickable show-arrow></uni-list-item>
			</uni-list>
		</uni-card>
		

	</view>
</template>

<script>
	export default {
		data() {
			return {
				user: {
					avatar: '/static/avatar.jpg',
					nickname: '海绵宝宝'
				}
			}
		},
		methods: {

		}
	}
</script>

<style scoped>
	.head {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 100rpx 0;
	}

	.avatar {
		width: 300rpx;
		height: 300rpx;
		border: 1rpx solid grey;
		border-radius: 100%;
	}

	.nickname {
		font-size: 1.2em;
		font-weight: bolder;
	}
</style>