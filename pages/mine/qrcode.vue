<template>
	<view class="qrcode-page">
		<canvas 
			class="qrcode-canvas" 
			canvas-id="qrcodeCanvas"
			:style="{
				width: size + 'px',
				height: size + 'px'
			}">
		</canvas>
	</view>
</template>

<script>
	import QRCode from 'qrcode';
	import { mapState } from 'pinia';
	import { userStore } from '../../store';
	
	export default {
		data() {
			return {
				size: 300
			};
		},
		computed: {
			...mapState(userStore, ['user']),
			
			qrContent() {
				const userId = this.user?.id || this.user?._id;
				return userId ? `user:${userId}` : 'user:unknown';
			}
		},
		onLoad() {
			uni.setNavigationBarTitle({
				title: '我的二维码'
			});
			
			// 检查用户信息
			if (!this.user || (!this.user.id && !this.user._id)) {
				uni.showToast({
					title: '用户信息获取失败',
					icon: 'error',
					duration: 2000
				});
				
				setTimeout(() => {
					uni.navigateBack();
				}, 2000);
				return;
			}
			
			// 计算合适的二维码大小
			this.calcSize();
		},
		onReady() {
			setTimeout(() => {
				this.generateQRCode();
			}, 100);
		},
		methods: {
			// 计算二维码大小
			calcSize() {
				try {
					const systemInfo = uni.getSystemInfoSync();
					const screenWidth = systemInfo.windowWidth;
					const screenHeight = systemInfo.windowHeight;
					
					// 取屏幕宽度和高度中较小的70%
					const minSize = Math.min(screenWidth, screenHeight);
					this.size = Math.floor(minSize * 0.7);
					
					// 限制最小和最大尺寸
					if (this.size < 200) this.size = 200;
					if (this.size > 400) this.size = 400;
				} catch (e) {
					// 如果获取失败，使用默认值
					this.size = 300;
				}
			},
			
			// 生成二维码
			async generateQRCode() {
				try {
					// 生成二维码图片
					const qrDataURL = await QRCode.toDataURL(this.qrContent, {
						width: this.size,
						height: this.size,
						margin: 2
					});
					
					// 绘制到canvas
					const ctx = uni.createCanvasContext('qrcodeCanvas', this);
					ctx.drawImage(qrDataURL, 0, 0, this.size, this.size);
					ctx.draw();
					
				} catch (error) {
					console.error('生成二维码失败:', error);
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.qrcode-page {
		width: 100vw;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #ffffff;
	}
	
	.qrcode-canvas {
		box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
		border-radius: 20rpx;
	}
</style>