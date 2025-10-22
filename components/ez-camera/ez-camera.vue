<template>
	<view>
		<view class="container" id="video-container">
		</view>
	</view>
</template>

<script>
import { EZUIKitPlayer } from "ezuikit-js";
	export default {
		name: "ez-camera",
		props: {
			sn: String,
			channel: Number,
		},
		data() {
			return {
				accessToken: "",
				player: null
			};
		},
		mounted() {
			const appKey = "d4defba50b5c4e70a9229bb88ea09d9b"
			const secret = "b4845736581dfe32caf5f1bf78cbfeae"

			
			this.auth(appKey, secret);
		},
		methods: {
			auth(appKey, appSecret){
				uni.request({
					url: "https://open.ys7.com/api/lapp/token/get",
					method: "POST",
					header: {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					data: "appKey=" + appKey + "&appSecret=" + appSecret,
					dataType: "json",
					success: (res) => {
						console.log("ez-camera token", res.data)
						if (res.data.code == "200") {
							this.accessToken = res.data.data.accessToken
							this.play()
							this.closeEncrypt()
						}				
					}
				
				})
			},
			closeEncrypt(){
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
				const url = "ezopen://open.ys7.com/" + this.sn + "/" + this.channel + ".hd.live" //GB4667293

				this.player = new EZUIKitPlayer({
					id: "video-container", // 视频容器ID
					accessToken: this.accessToken,
					url: url,
					// simple: 极简版; pcLive: pc直播; pcRec: pc回放; mobileLive: 移动端直播; mobileRec: 移动端回放;security: 安防版; voice: 语音版;
					template: "mobileLive",
					plugin: ["talk"], // 加载插件，talk-对讲
					width: windowWidth || 375,
					height: windowWidth * 2 / 3,
					// quality: 1, // 
					// language: "en", // zh | en
					handleError: (err) => {
						console.error("handleError", err);
					},
					// 自定义清晰度 默认 null, 如果有值 sdk 内部不在进行获取, null 默认使用接口获取的清晰度列表, videoLevelList.length === 0 不展示清晰度控件 sdk 内部不在进行获取, videoLevelList.length > 0 展示控件 sdk 内部不在进行获取
					// videoLevelList: [
					//   { level: 0, name: "流畅", streamTypeIn: 1 },
					//   { level: 1, name: "标清", streamTypeIn: 1 },
					// ],
					// staticPath: "/ezuikit_static", // 如果想使用本地静态资源，请复制根目录下ezuikit_static 到当前目录下， 然后设置该值
					env: {
						// https://open.ys7.com/help/1772?h=domain
						// domain默认是 https://open.ys7.com, 如果是私有化部署或海外的环境，请配置对应的domain
						// The default domain is https://open.ys7.com If it is a private deployment or overseas (outside of China) environment, please configure the corresponding domain
						domain: "https://open.ys7.com",
					},
					// staticPath: "https://openstatic.ys7.com/ezuikit_js/v8.1.9/ezuikit_static",
					// 日志打印设置
					loggerOptions: {
						// player.setLoggerOptions(options)
						level: "INFO", // INFO LOG  WARN  ERROR
						name: "ezuikit",
						showTime: true,
					},
					// 视频流的信息回调类型
					/**
					 * 打开流信息回调，监听 streamInfoCB 事件
					 * 0 : 每次都回调
					 * 1 : 只回调一次
					 * 注意：会影响性能
					 * 默认值 1
					 */
					streamInfoCBType: 1,
					// v8.1.10
					// 自定义清晰度 默认 null, 如果有值 sdk 内部不在进行获取, null 默认使用接口获取的清晰度列表, videoLevelList.length === 0 不展示清晰度控件 sdk 内部不在进行获取, videoLevelList.length > 0 展示控件 sdk 内部不在进行获取
					// videoLevelList: [
					//   { level: 1, name: "标清", streamTypeIn: 2 }, // 需要保证支持子码流 (streamTypeIn=2)
					//   { level: 2, name: "高清", streamTypeIn: 1 },
					// ],
					handleFirstFrameDisplay: () => {
						player.setWaterMarkFont({
							fontString: ["watermark"], // 水印文本内容
							startPos: {
								fX: 0.1,
								fY: 0.1
							},
							fontColor: {
								fR: 0, // 红色分量(黑色)
								fG: 0, // 绿色分量(黑色)
								fB: 0, // 蓝色分量(黑色)
								fA: 1, // 透明度(不透明)
							},
							fontSize: {
								nFontWidth: 24,
								nFontHeight: 24,
							},
							fontRotate: {
								fRotateAngle: 0, // 旋转角度
								fFillFullScreen: true, // 平铺整个屏幕
							},
							fontFamily: "Arial", // 字体
							fontNumber: {
								nRowNumber: 4, // 行数
								nColNumber: 4, // 列数
							},
							space: 1, // 行间距
						});
					}
				});

				this.player.eventEmitter.on(EZUIKitPlayer.EVENTS.videoInfo, (info) => {
					console.log("videoinfo", info);
				});

				this.player.eventEmitter.on(EZUIKitPlayer.EVENTS.audioInfo, (info) => {
					console.log("audioInfo", info);
				});

				// 首帧渲染成功
				// first frame display
				this.player.eventEmitter.on(EZUIKitPlayer.EVENTS.firstFrameDisplay, () => {
					console.log("firstFrameDisplay ");
				});
				this.player.eventEmitter.on(EZUIKitPlayer.EVENTS.streamInfoCB, (info) => {
					console.log("streamInfoCB ", info);
				});
				//window.player = this.player;
			}
		}
	}
</script>

<style>

</style>