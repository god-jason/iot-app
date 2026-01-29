<template>
	<view class="page">

		<!-- <ez-camera key="" secret="" sn="GA1719614" :channel="1"></ez-camera> -->

		<view class="opers">
			<uni-grid :column="3" :square="false" :show-border="false">
				<uni-grid-item>
					<view class="oper" @click="openSettings">
						<uni-icons type="settings-filled" size="30" color="white"></uni-icons>
						参数配置
					</view>
				</uni-grid-item>
				<uni-grid-item>
					<view class="oper" @click="editDevice">
						<uni-icons type="compose" size="30" color="white"></uni-icons>
						修改信息
					</view>
				</uni-grid-item>
				<uni-grid-item>
					<view class="oper" @click="log">
						<uni-icons type="info" size="30" color="white"></uni-icons>
						操作日志
					</view>
				</uni-grid-item>
			</uni-grid>

		</view>

		<view class="points">
			
			<view v-for="(p, k) in model.properties" :key="k">
				<uni-grid v-if="!p.hidden || user.admin" :column="3" :show-border="false" :square="false">
					<uni-grid-item v-for="(p, k) in p.points" :key="k">
						<view class="point" @click="onPropertyClick(p)">
							<view class="label">{{p.label}}{{p.unit}}</view>
							<view class="value">{{formatValue(p.name)}}</view>
						</view>
					</uni-grid-item>
				</uni-grid>
			</view>
			
		</view>
		

		<view class="">
			更新时间：{{fromNow(values._update)}}
		</view>

		<view class="actions">
			<text class="title">设备操作</text>
			<label>
				批量
				<switch :checked="batch" @change="batch=$event.detail.value" />
			</label>
		</view>


		<!-- 动作响应 -->
		<uni-grid :column="2" :show-border="false" :square="false">
			<uni-grid-item v-for="(p, k) in model.actions.filter(s=>user.admin || !s.hidden)" :key="k">

				<view v-if="p.type == 'button'" class="action-button" @click="actionClick(p)">{{p.label}}</view>

				<view v-else-if="p.type == 'switch'" class="action-button">
					<switch :checked="p.bind ? values[p.bind] : false" @change="actionValueChange(p, $event)" />
					<text class="action-label">{{p.label}}</text>
				</view>

				<view v-else-if="p.type == 'slider'" class="action-button">
					<slider :value="p.bind ? values[p.bind] : 0" @change="actionValueChange(p, $event)" />
					<text class="action-label">{{p.label}}</text>
				</view>

				<view v-else-if="p.type == 'form'" class="action-button" @click="actionForm(p, k)">{{p.label}}
				</view>

				<view v-else class="action-button" @click="actionClick(p)">{{p.label}}</view>

			</uni-grid-item>
		</uni-grid>

	</view>
</template>

<script>
	import dayjs from "dayjs"

	import {
		checkMqtt,
		subscribe,
		unsubscribe
	} from '../../utils/broker';
	import {
		getModel
	} from '../../utils/model';
	import {
		mapState
	} from 'pinia';
	import {
		userStore
	} from '../../store';
	import {
		get,
		post
	} from '../../utils/request'

	export default {
		data() {
			return {
				id: undefined,
				device: undefined,
				batch: false,
				model: {
					properties: [],
					actions: []
				},
				values: {}
			}
		},
		computed: {
			...mapState(userStore, ['user', 'group']),
		},
		onPullDownRefresh() {
			uni.stopPullDownRefresh()
			this.load()
			this.watch()
		},
		onLoad(options) {
			this.id = options.id
			this.load()
			this.watch()
			this.subscribe()
		},
		onUnload() {
			this.unsubscribe()
		},
		onShow() {
			checkMqtt()
		},
		methods: {
			formatValue(name) {
				if (!this.values.hasOwnProperty(name))
					return 0
				let val = this.values[name]
				switch (typeof(val)) {
					case "boolean":
						return val ? "通" : "断"
				}
				return val;
			},
			subscribe() {
				//订阅变化
				subscribe("device/" + this.id + "/values", (topic, payload) => {
					Object.assign(this.values, payload)
				})
				//订阅响应
				subscribe("device/" + this.id + "/action/+/response", (topic, payload) => {
					if (payload.ok) {
						uni.showToast({
							icon: 'success',
							title: "执行成功"
						})
					} else {
						uni.showToast({
							icon: 'error',
							title: "执行失败：" + payload.data
						})
					}
				})
			},
			unsubscribe() {
				unsubscribe("device/" + this.id + "/values") //TODO 全部取消订阅了
				unsubscribe("device/" + this.id + "/action/response")
			},
			fromNow(d) {
				if (!d) return "--"
				return dayjs(d).fromNow()
			},
			async load() {
				let res = await get("table/device/detail/" + this.id)
				this.device = res.data;

				uni.setNavigationBarTitle({
					title: this.device.name || this.device.id
				})
				this.loadAction()
				this.loadValues()
			},
			async loadValues() {

				//2、查询实时状态
				let res = await get("iot/device/" + this.id + "/values")
				this.values = res.data
			},
			async watch() {
				let res = await post("iot/device/" + this.id + "/action/watch", {
					value: 5,
				})
			},
			async loadAction() {
				let res = await getModel(this.device.product_id)
				this.model = res || {
					actions: [],
					properties: [],
				}

				console.log("model", this.model)
			},
			onPropertyClick(property) {
				uni.navigateTo({
					url: "/pages/device/history?id=" + this.device.id + "&point=" + property.name
				})
			},
			openSettings() {
				uni.navigateTo({
					url: '/pages/device/settings?id=' + this.id + "&product_id=" + this.device.product_id
				})
			},
			async actionClick(action) {
				if (this.batch) {
					uni.navigateTo({
						url: "/pages/device/select",
						events: {
							devices: (devices) => {
								for (var index = 0; index < devices.length; index++) {
									var id = devices[index];
									post("iot/device/" + id + "/action/" + action.name, {}).then(() => {})
								}
							}
						}
					})
					return
				}

				let res = await post("iot/device/" + this.id + "/action/" + action.name, {})
			},
			async actionValueChange(action, $event) {
				if (this.batch) {
					uni.navigateTo({
						url: "/pages/device/select",
						events: {
							devices: (devices) => {
								//console.log("get batches", devices)
								for (var index = 0; index < devices.length; index++) {
									var id = devices[index];
									post("iot/device/" + id + "/action/" + action.name, {
										//[action.bind || "value"]: $event.detail.value
										value: $event.detail.value,
									}).then(() => {})
								}
							}
						}
					})
					return
				}

				console.log(action, $event.detail.value)
				let res = await post("iot/device/" + this.id + "/action/" + action.name, {
					//[action.bind || "value"]: $event.detail.value
					value: $event.detail.value,
				})
			},
			actionForm(action, index) {

				uni.navigateTo({
					url: "/pages/device/action?id=" + this.id + "&product_id=" + this.device.product_id +
						"&index=" + index,
						
					success: (res) => {
						
						if (this.batch)
							setTimeout(() => {
								uni.navigateTo({
									url: "/pages/device/select",
									events: {
										devices: (devices) => {
											// uni.navigateTo({
											// 	url: "/pages/device/action?id=" + devices + "&product_id=" + this
											// 		.device.product_id +
											// 		"&index=" + index
											// })
											res.eventChannel.emit("devices", devices)
										}
									}
								})
							}, 1000)

					}
				})



			},
			editDevice() {
				uni.navigateTo({
					url: '/pages/device/edit?id=' + this.id
				});
			},
			log() {
				uni.navigateTo({
					url: '/pages/device/log?id=' + this.id
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.points{
		background-color: #2a2a2a;
	}
	
	.point {
		text-align: center;
		font-size: 16px;
		//color: black;
		//font-weight: bold;

		padding: 10rpx 0;
		//border: 1px solid #c0c0c0;
		//margin: 10rpx 0;

		.label {
			font-size: 16px;
			text-overflow: ellipsis;
			overflow: hidden;
		}

		.value {
			//color: black;
			font-weight: bold;
			padding: 10px 0;
			font-size: 32px;
		}

	}

	.action-button {
		font-size: 20px;
		font-weight: bold;
		margin: 5px;
		padding: 20px 0;
		//width: 100%;
		height: 100%;
		min-height: 40px;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		//border: 1px solid #c0c0c0;
		//border-radius: 5px;
		//background-color: #f0f0f0;
		//margin: 10rpx;
		//color: black;
		color: white;
		background-color: #474747;
		border: 1rpx solid #616161;
		letter-spacing: 4rpx;
		
	}

	.action-label {
		margin-top: 20rpx;
		//color: black;
		color: white;
		letter-spacing: 4rpx;
	}

	.opers {
		background-color: #474747;
	}

	.oper {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		padding: 20rpx 0;
	}

	.actions {
		background-color: #474747;
		padding: 20rpx;
		margin: 16rpx 0;

		display: flex;
		flex-direction: row;
		//justify-content: center;
		align-items: center;

		.title {
			flex: 1;
		}
	}
</style>