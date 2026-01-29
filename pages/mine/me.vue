<template>
	<view class="page">
		<view class="head">
			<image class="avatar" mode="aspectFill" :src="user.avatar || avatar"></image>
			<view class="nickname">
				{{user.nickname || user.name || '无名'}}
			</view>
		</view>

		<uni-card>


			<uni-list :border="false">
				<uni-list-item title="我的二维码" clickable show-arrow show-extra-icon @click="navigateToQRCode"
					:extra-icon="{color:'#1296db', size:'28', type:'info'}"></uni-list-item>
				<uni-list-item title="我的组织" clickable show-arrow show-extra-icon link="navigateTo"
					:right-text="group.name" to="/pages/mine/group"
					:extra-icon="{color:'#1296db', size:'28', type:'staff'}"></uni-list-item>
				<uni-list-item title="绑定设备" clickable show-arrow show-extra-icon link="navigateTo"
					to="/pages/device/bind" :extra-icon="{color:'#1296db', size:'28', type:'scan'}"></uni-list-item>

				<!--
				<uni-list-item title="客户支持" clickable show-arrow show-extra-icon @click="support"
					:extra-icon="{color:'#1296db', size:'28', type:'headphones'}"></uni-list-item>
				<uni-list-item title="意见反馈" clickable show-arrow show-extra-icon @click="feedback"
					:extra-icon="{color:'#1296db', size:'28', type:'flag'}"></uni-list-item>
				-->

				<uni-list-item class="list-item" title="修改个人信息" clickable show-arrow show-extra-icon link="navigateTo"
					to="/pages/mine/info" :extra-icon="{color:'#1296db', size:'28', type:'person'}"></uni-list-item>
				<uni-list-item class="list-item" title="修改密码" clickable show-arrow @click="changePassword"
					show-extra-icon :extra-icon="{color:'#007aff', size:'28', type:'locked'}">
				</uni-list-item>
				<uni-list-item class="list-item" title="退出" clickable show-extra-icon @click="logout"
					:extra-icon="{color:'#1296db', size:'28', type:'close'}"></uni-list-item>
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
		get,
		post
	} from '../../utils/request';

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
				await user.checkGroup()
			},

			// 跳转到二维码页面
			navigateToQRCode() {
				// 创建一个专门的二维码页面
				uni.navigateTo({
					url: '/pages/mine/qrcode'
				});
			},

			// 修改密码
			changePassword() {
				uni.navigateTo({
					url: '/pages/mine/changePassword'
				});
			},

			// 客户支持
			support() {
				uni.showModal({
					title: '客户支持',
					content: '如需帮助，请联系客服电话：400-xxx-xxxx',
					showCancel: false,
					confirmText: '知道了'
				});
			},

			// 意见反馈
			feedback() {
				uni.showModal({
					title: '意见反馈',
					content: '请将您的意见发送到邮箱：feedback@example.com',
					showCancel: false,
					confirmText: '知道了'
				});
			},

			// 退出登录
			logout() {
				uni.showModal({
					title: '退出登录',
					content: '确定要退出登录吗？',
					success: (res) => {
						if (res.confirm) {
							try {
								uni.removeStorageSync('token');
								uni.removeStorageSync('userInfo');
							} catch (e) {
								console.error('清除存储失败:', e);
							}

							uni.reLaunch({
								url: '/pages/login/login'
							});
						}
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #f8f8f8;
	}

	.head {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 60rpx 0;
	}

	.avatar {
		width: 300rpx;
		height: 300rpx;
		border-radius: 100%;
	}

	.nickname {
		font-size: 1.2em;
		font-weight: bolder;
		margin-top: 20rpx;
	}

	.uni-list-item {
		transition: all 0.3s ease;

		&:active {
			background-color: #f5f5f5;
			transform: translateX(10rpx);
		}
	}
</style>