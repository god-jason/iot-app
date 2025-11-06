<template>
	<view class="container">
		<view class="head">
			<image class="avatar" mode="aspectFill" :src="user.avatar || avatar"></image>
			<view class="nickname">
				{{user.nickname || user.name}}
			</view>
		</view>

		<uni-card>
			<uni-list :border="false">
				<uni-list-item title="个人信息" clickable show-arrow show-extra-icon link="navigateTo" to="/pages/mine/info"
					:extra-icon="{color:'#1296db', size:'28', type:'person'}"></uni-list-item>
				<uni-list-item title="我的组织" clickable show-arrow show-extra-icon link="navigateTo"
					:right-text="group.name" to="/pages/mine/group"
					:extra-icon="{color:'#1296db', size:'28', type:'staff'}"></uni-list-item>
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


	</view>
</template>

<script>
	
import { mapState } from 'pinia';
import { userStore } from '../../store';
import { get, post } from '../../utils/request';

const user = userStore()

	export default {
		data() {
			return {
				avatar: '/static/avatar.jpg'
			}
		},
		computed: {
			...mapState(userStore, ['user', 'group']),
		},
		onLoad() {
			this.load()
		},
		methods: {
			async load() {
				await user.getGroup()

			}
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
		//border: 1rpx solid grey;
		border-radius: 100%;
	}

	.nickname {
		font-size: 1.2em;
		font-weight: bolder;
	}
</style>