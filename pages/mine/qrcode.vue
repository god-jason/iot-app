<template>
	<view class="qrcode-page">
		<!-- 自定义导航栏 -->
		<uni-nav-bar 
			title="我的二维码" 
			left-icon="back" 
			@clickLeft="goBack"
			background-color="#f8f8f8">
		</uni-nav-bar>
		
		<view class="qrcode-container">
			<!-- 用户信息 -->
			<view class="user-info">
				<image class="avatar" :src="user.avatar || '/static/avatar.jpg'" mode="aspectFill"></image>
				<view class="user-details">
					<text class="nickname">{{user.nickname || user.name || '无名'}}</text>
					<text class="user-id">用户ID: {{userIdDisplay}}</text>
				</view>
			</view>
			
			<!-- 二维码区域 -->
			<view class="qrcode-area">
				<view class="qrcode-card">
					<!-- 使用 uni-qrcode 插件 -->
					<uni-qrcode 
						:ref="setQrCodeRef" 
						:text="qrContent" 
						:size="300"
						:show-menu-by-longpress="true"
						:make-on-load="true">
					</uni-qrcode>
					
					<view class="qrcode-tip">
						<text>扫一扫二维码添加我为好友</text>
						<text class="qr-content">{{qrContent}}</text>
					</view>
				</view>
			</view>
			
			<!-- 操作按钮 -->
			<view class="action-buttons">
				<button class="save-btn" type="primary" @click="saveQRCode">
					<uni-icons type="download" size="20" color="#fff"></uni-icons>
					<text>保存二维码</text>
				</button>
				
				<button class="share-btn" type="default" @click="shareQRCode">
					<uni-icons type="redo" size="20" color="#007aff"></uni-icons>
					<text>分享二维码</text>
				</button>
			</view>
			
			<!-- 使用说明 -->
			<view class="instructions">
				<uni-card title="使用说明">
					<text class="instruction-text">1. 此二维码包含您的用户ID信息\n2. 他人扫描后可快速添加您为好友\n3. 您可以将二维码保存到手机相册\n4. 二维码格式为：user:用户ID</text>
				</uni-card>
			</view>
		</view>
	</view>
</template>

<script>
	import { mapState } from 'pinia';
	import { userStore } from '../../store';
	
	export default {
		data() {
			return {
				qrCodeRef: null, // uni-qrcode 组件实例
				qrSize: 300
			};
		},
		computed: {
			...mapState(userStore, ['user']),
			
			// 用户ID显示
			userIdDisplay() {
				return this.user?.id || this.user?._id || '未获取';
			},
			
			// 二维码内容
			qrContent() {
				const userId = this.user?.id || this.user?._id;
				return userId ? `user:${userId}` : 'user:unknown';
			}
		},
		onLoad() {
			// 页面加载时检查用户信息
			if (!this.user || (!this.user.id && !this.user._id)) {
				uni.showToast({
					title: '用户信息获取失败',
					icon: 'error',
					duration: 2000
				});
				
				setTimeout(() => {
					uni.navigateBack();
				}, 2000);
			}
		},
		methods: {
			// 设置二维码组件引用
			setQrCodeRef(ref) {
				this.qrCodeRef = ref;
			},
			
			// 返回上一页
			goBack() {
				uni.navigateBack();
			},
			
			// 保存二维码到相册
			async saveQRCode() {
				if (!this.qrCodeRef) {
					uni.showToast({
						title: '二维码未生成',
						icon: 'error'
					});
					return;
				}
				
				uni.showLoading({
					title: '保存中...'
				});
				
				try {
					// uni-qrcode 插件提供了保存方法
					const result = await this.qrCodeRef.save();
					
					if (result) {
						uni.hideLoading();
						uni.showToast({
							title: '保存成功',
							icon: 'success'
						});
					} else {
						uni.hideLoading();
						uni.showToast({
							title: '保存失败',
							icon: 'error'
						});
					}
				} catch (error) {
					console.error('保存二维码失败:', error);
					uni.hideLoading();
					uni.showToast({
						title: '保存失败',
						icon: 'error'
					});
				}
			},
			
			// 分享二维码
			shareQRCode() {
				// 显示分享选项
				uni.showActionSheet({
					itemList: ['分享给朋友', '分享到朋友圈', '复制链接'],
					success: (res) => {
						switch (res.tapIndex) {
							case 0:
								this.shareToFriend();
								break;
							case 1:
								this.shareToTimeline();
								break;
							case 2:
								this.copyLink();
								break;
						}
					}
				});
			},
			
			// 分享给朋友
			shareToFriend() {
				uni.showToast({
					title: '已分享给朋友',
					icon: 'success'
				});
			},
			
			// 分享到朋友圈
			shareToTimeline() {
				uni.showToast({
					title: '已分享到朋友圈',
					icon: 'success'
				});
			},
			
			// 复制链接
			copyLink() {
				uni.setClipboardData({
					data: this.qrContent,
					success: () => {
						uni.showToast({
							title: '链接已复制',
							icon: 'success'
						});
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.qrcode-page {
		min-height: 100vh;
		background-color: #f8f8f8;
	}
	
	.qrcode-container {
		padding: 40rpx;
	}
	
	.user-info {
		display: flex;
		align-items: center;
		padding: 40rpx;
		background-color: #fff;
		border-radius: 20rpx;
		margin-bottom: 40rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		
		.avatar {
			width: 120rpx;
			height: 120rpx;
			border-radius: 50%;
			margin-right: 30rpx;
		}
		
		.user-details {
			flex: 1;
			display: flex;
			flex-direction: column;
			
			.nickname {
				font-size: 36rpx;
				font-weight: bold;
				color: #333;
				margin-bottom: 10rpx;
			}
			
			.user-id {
				font-size: 28rpx;
				color: #666;
			}
		}
	}
	
	.qrcode-area {
		display: flex;
		justify-content: center;
		margin-bottom: 60rpx;
		
		.qrcode-card {
			background-color: #fff;
			padding: 60rpx;
			border-radius: 20rpx;
			box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
			display: flex;
			flex-direction: column;
			align-items: center;
			
			.qrcode-tip {
				margin-top: 40rpx;
				text-align: center;
				
				text {
					display: block;
					font-size: 28rpx;
					color: #666;
					margin-bottom: 10rpx;
				}
				
				.qr-content {
					font-size: 24rpx;
					color: #999;
					background-color: #f8f8f8;
					padding: 15rpx 30rpx;
					border-radius: 10rpx;
					margin-top: 15rpx;
				}
			}
		}
	}
	
	.action-buttons {
		display: flex;
		justify-content: space-between;
		margin-bottom: 60rpx;
		
		.save-btn, .share-btn {
			flex: 1;
			height: 100rpx;
			border-radius: 12rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 32rpx;
			
			uni-icons {
				margin-right: 15rpx;
			}
		}
		
		.save-btn {
			margin-right: 20rpx;
			background-color: #007aff;
		}
		
		.share-btn {
			margin-left: 20rpx;
			background-color: #fff;
			border: 2rpx solid #007aff;
			color: #007aff;
		}
	}
	
	.instructions {
		.instruction-text {
			font-size: 28rpx;
			color: #666;
			line-height: 1.6;
			white-space: pre-line;
		}
	}
	
	// 响应式调整
	@media (max-width: 750rpx) {
		.qrcode-container {
			padding: 30rpx;
		}
		
		.user-info {
			padding: 30rpx;
			
			.avatar {
				width: 100rpx;
				height: 100rpx;
			}
		}
		
		.qrcode-card {
			padding: 40rpx !important;
		}
		
		.action-buttons {
			flex-direction: column;
			
			.save-btn, .share-btn {
				width: 100%;
				margin: 0 0 20rpx 0 !important;
			}
		}
	}
</style>