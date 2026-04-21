<template>
	<view>

		<!-- #ifndef MP-WEIXIN -->
		<view class="container" id="video-container">
		</view>
		<!-- #endif -->

		<!-- #ifdef MP-WEIXIN -->
		<ezplayer id="ezplayer" :accessToken="accessToken" :url="video_url"
		    plugins="talk,voice,ptz,privacy,mirror"
			recPlayTime=""
			theme="{{ { showCapture: true, showBottomBar: true, showDatePicker: true, showTypeSwitch: true } }}"
			bind:handleError="handleError" bind:onControlEvent="onControlEvent" />
		<!-- #endif -->


	</view>
</template>

<script>
	//注意!!! 微信小程序需要先在后台开通视频流权限，需要《增值电信业务许可证》国内多方通信服务业务 或 《中国国家强制性产品认证证书》
	//需要使用微信插件，否则体积太大，插件ID为wxf2b3a0262975d8c2
	// #ifndef MP-WEIXIN	
	import {
		EZUIKitPlayer
	} from "ezuikit-js";
import { onBeforeUnmount, onUnmounted } from "vue";
import { ez_app_key, ez_secret } from "../../app.config";
	// #endif

	export default {
		name: "ez-camera",
		props: {
			sn: String,
			channel: Number,
		},
		data() {
			return {
				accessToken: "",
				video_url: "",
				player: null,
			};
		},
		mounted() {
			this.auth();
		},
		onUnmounted() {
			this.player.stop();
			this.player.destroy();
		},
		methods: {
			auth() {
				uni.request({
					url: "https://open.ys7.com/api/lapp/token/get",
					method: "POST",
					header: {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					data: "appKey=" + ez_app_key + "&appSecret=" + ez_secret,
					dataType: "json",
					success: (res) => {
						console.log("ez-camera token", res.data)
						if (res.data.code == "200") {
							this.accessToken = res.data.data.accessToken
							// #ifdef MP-WEIXIN							
							//rtmp://open.ys7.com/BA7248908/1/live
							this.video_url = "rtmp://open.ys7.com/" + this.sn + "/" + (this.channel || 1) +
								"/live" //GB4667293
							// #endif

							// #ifndef MP-WEIXIN
							this.play()
							//this.closeEncrypt()
							// #endif
						}
					}

				})
			},
			closeEncrypt() {
				uni.request({
					url: "https://open.ys7.com/api/lapp/device/encrypt/off",
					method: "POST",
					header: {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					data: "accessToken=" + this.accessToken + "&deviceSerial=" + this.sn,
					dataType: "json",
					success: (res) => {
						console.log("ez-camera close encrypt", res.data)
					}

				})
			},
			play() {

				console.log("ez-camera play")
				const si = uni.getSystemInfoSync();
				const windowWidth = si.windowWidth;

				//"ezopen://open.ys7.com/BC7799091/1.hd.live",
				const url = "ezopen://open.ys7.com/" + this.sn + "/" + this.channel + ".live" //GB4667293

				this.player = new EZUIKitPlayer({
					id: "video-container", // 视频容器ID
					accessToken: this.accessToken,
					autoPlay: true,
					url: url,
					// simple: 极简版; pcLive: pc直播; pcRec: pc回放; mobileLive: 移动端直播; mobileRec: 移动端回放;security: 安防版; voice: 语音版;
					//template: "simple",
					//template: "pcLive",
					template: "mobileLive",
					//plugin: ["talk","voice","ptz","privacy","mirror"], // 加载插件，talk-对讲
					width: windowWidth || 375,
					height: windowWidth * 2 / 3,
					streamInfoCBType: 0,
					handleSuccess:()=>{
						// 3分钟自动关闭
						setTimeout(()=>{
							this.player.stop()
						}, 3 * 60 * 1000)
					}
				});
				
				//关闭流信息显示
				this.player.displayStreamInfo(false);
				//关闭云台
				this.player.closePtz()
			}
		}
	}
</script>

<style>

[video-container-streamInfo]{
	display: none;
}

/* 隐藏云台控制，太大了 */
.ezplayer-mobile-extend{
	display: none !important;
}

</style>