<template>
	<view class="container">
		<view class="head">
			<image class="avatar" mode="aspectFill" :src="user.avatar"></image>
			<view class="nickname">
				{{user.nickname}}
			</view>
		</view>

		<uni-card>
			<uni-list :border="false">
				<uni-list-item title="个人信息" clickable show-arrow show-extra-icon link="navigateTo" to="/pages/mine/info"
					:extra-icon="{color:'#1296db', size:'28', type:'person'}"></uni-list-item>
				<uni-list-item title="我的组织" clickable show-arrow show-extra-icon link="navigateTo"
					:right-text="group.name"
					to="/pages/mine/group" :extra-icon="{color:'#1296db', size:'28', type:'staff'}"></uni-list-item>
				<uni-list-item title="绑定设备" clickable show-arrow show-extra-icon link="navigateTo"
					to="/pages/device/bind" :extra-icon="{color:'#1296db', size:'28', type:'scan'}"></uni-list-item>
				<uni-list-item title="客户支持" clickable show-arrow show-extra-icon
					:extra-icon="{color:'#1296db', size:'28', type:'headphones'}"></uni-list-item>
				<uni-list-item title="意见反馈" clickable show-arrow show-extra-icon
					:extra-icon="{color:'#1296db', size:'28', type:'flag'}"></uni-list-item>
				<uni-list-item title="退出" clickable show-extra-icon link="navigateTo" to="/pages/login/login"
					:extra-icon="{color:'#1296db', size:'28', type:'close'}"></uni-list-item>
			</uni-list>
		</uni-card>

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
				user: {
					avatar: '/static/avatar.jpg',
					nickname: '海绵宝宝'
				},
				group:{
					name: "南京真格智能科技有限公司"
				}
			}
		},
		methods: {

		}
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		//background: linear-gradient(135deg, #1296db 0%, #764ba2 100%);
		//background-color: #1296db;
		background-color: #f8f8f8;
	}

	.head {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 120rpx 0 60rpx;
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