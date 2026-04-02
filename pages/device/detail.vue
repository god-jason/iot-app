<template>
	<view class="page">

		<view class="error" v-if="values.error_string || device.error_string" @click="clearError">
			错误：{{values.error_string || device.error_string}}
		</view>

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

			<uni-grid :column="3" :show-border="false" :square="false">
				<uni-grid-item v-for="(p, k) in points" :key="k">
					<view class="point">
						<view class="inner" @click="onPropertyClick(p)">
							<view class="label">{{p.label}}{{p.unit||''}}</view>
							<view class="value">{{formatValue(p.name)}}</view>
						</view>
					</view>
				</uni-grid-item>
			</uni-grid>

		</view>


		<view class="update">
			更新时间：{{formatDateTime(values._update)}}
		</view>

		<!-- 设备信息 -->
		<!-- 		<uni-card v-if="device" title="设备信息">
			<view class="info-item" v-if="device.error !== undefined && device.error !== null && device.error !== ''">
				<text class="info-label">错误：</text>
				<text class="info-value">{{ formatError(device.error) }}</text>
			</view>
		</uni-card> -->

		<view class="actions">
			<text class="title">设备操作</text>
			<label>
				批量
				<switch :checked="batch" @change="batch=$event.detail.value" />
			</label>
		</view>


		<!-- 动作响应 -->
		<uni-grid :column="2" :show-border="false" :square="false">
			<uni-grid-item v-for="(p, k) in actions" :key="k">

				<view v-if="p.type == 'button'" class="action-button" @click="actionClick(p)">
					<text class="action-label">{{p.label}}</text>
				</view>

				<view v-else-if="p.type == 'switch'" class="action-button">
					<switch :checked="p.bind ? values[p.bind] : false" @change="actionValueChange(p, $event)" />
					<text class="action-label">{{p.label}}</text>
				</view>

				<view v-else-if="p.type == 'slider'" class="action-button">
					<slider :value="p.bind ? values[p.bind] : 0" @change="actionValueChange(p, $event)" />
					<text class="action-label">{{p.label}}</text>
				</view>

				<view v-else-if="p.type == 'form'" class="action-button" @click="actionForm(p, k)">
					<text class="action-label">
						{{p.label}}
					</text>
				</view>

				<view v-else class="action-button" @click="actionClick(p)">
					<text class="action-label">{{p.label}}</text>
				</view>

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
		getSetting
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
				device: {},
				batch: false,
				points: [],
				actions: [],
				values: {},
				batch_result: {}
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
					return "-"
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
					this.values._update = new Date()
				})
				//订阅响应
				// subscribe("device/" + this.id + "/action/+/response", (topic, payload) => {
				// 	if (payload.ok) {
				// 		uni.showToast({
				// 			icon: 'success',
				// 			title: "执行成功"
				// 		})
				// 	} else {
				// 		uni.showToast({
				// 			icon: 'error',
				// 			title: "执行失败：" + payload.data
				// 		})
				// 	}
				// })
			},
			unsubscribe() {
				unsubscribe("device/" + this.id + "/values") //TODO 全部取消订阅了
				//unsubscribe("device/" + this.id + "/action/response")
			},
			fromNow(d) {
				if (!d) return "--"
				return dayjs(d).fromNow()
			},
			formatDateTime(d) {
				if (!d) return "--"
				const t = dayjs(d)
				if (!t.isValid()) return "--"
				return t.format('YYYY-MM-DD HH:mm:ss')
			},
			formatError(err) {
				if (err === undefined || err === null || err === '') return "--"
				if (typeof err === 'string' || typeof err === 'number' || typeof err === 'boolean') return String(err)
				try {
					return JSON.stringify(err)
				} catch (e) {
					return String(err)
				}
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
				let res = await get("device/" + this.id + "/values")
				this.values = res.data || {}
			},
			async watch() {
				let res = await post("device/" + this.id + "/action/watch", {
					name: "查看",
					value: 5,
				})
			},
			async loadAction() {
				
				
				let res = await getSetting(this.device.product_id, "model")
				if (!res) {
					uni.showToast({
						icon: "error",
						title: "找不到物模型"
					})
					return
				}
				
				console.log("model", res)

				this.points = []
				res.content.forEach(p => {
					if (p.hidden && !this.user.admin) return
					p.points.forEach(pp => {
						if (pp.name) {
							this.points.push(pp)
						}
						pp.bits && pp.bits.forEach(b => {
							this.points.push(b)
						})
					})
				})

				res = await getSetting(this.device.product_id, "action")
				this.actions = []
				res.content.forEach(a => {
					if (a.hidden && !this.user.admin) return
					this.actions.push(a)
				})

				console.log(this.points, this.actions)
			},
			clearError() {
				uni.showModal({
					title: "提示",
					content: "是否要强制清空错误",
					success: (res) => {
						if (res.confirm) {
							this.values.error = false
							this.values.error_string = ""

							//清理数据库
							get("device/" + this.id + "/error/clear").then(() => {
								this.device.error = false
								this.device.error_string = ""
							})

							//清理设备
							post("device/" + this.id + "/action/clear_error", {
								name: "强制清除错误"
							}).then()
						}
					}
				})
			},
			onPropertyClick(property) {
				uni.navigateTo({
					url: "/sub/device/history?id=" + this.device.id + "&point=" + property.name
				})
			},
			openSettings() {
				uni.navigateTo({
					url: '/pages/device/settings?id=' + this.id + "&product_id=" + this.device.product_id
				})
			},
			checkBatchResult(succ) {
				if (succ) this.batch_result.success++
				else this.batch_result.fail++

				//console.log("checkBatchResult", succ, this.batch_result)				

				let pro = this.batch_result.success + this.batch_result.fail

				if (pro >= this.batch_result.total) {
					uni.hideLoading()

					let text = "批量操作完成"
					if (this.batch_result.success > 0)
						text += ", 成功" + this.batch_result.success + "条"
					if (this.batch_result.fail > 0)
						text += ", 失败" + this.batch_result.fail + "条"
					// uni.showToast({
					// 	icon: 'success',
					// 	title: text,
					// 	duration: 5000
					// })
					uni.showModal({
						title: "提示",
						content: text
					})
				} else {
					let text = "批量操作执行中"
					if (this.batch_result.success > 0)
						text += ", 成功" + this.batch_result.success + "条"
					if (this.batch_result.fail > 0)
						text += ", 失败" + this.batch_result.fail + "条"
					uni.showLoading({
						title: text
					})
				}
			},
			async actionClick(action) {
				if (this.batch) {
					uni.navigateTo({
						url: "/pages/device/select",
						events: {
							devices: (devices) => {
								if (devices.length == 0)
									return

								uni.showLoading({
									title: "执行中"
								})

								this.batch_result = {
									total: devices.length,
									success: 0,
									fail: 0,
								}
								for (var index = 0; index < devices.length; index++) {
									var id = devices[index];
									post("device/" + id + "/action/" + action.name, {
										name: action.label
									}).then((res) => {
										console.log("batch then", res)
										this.checkBatchResult(true)
									}).catch(err => {
										console.log("batch catch", err)
										this.checkBatchResult(false)
									})
								}
							}
						}
					})
					return
				}

				let res = await post("device/" + this.id + "/action/" + action.name, {
					name: action.label,
				})
				uni.showToast({
					icon: 'success',
					title: "执行成功"
				})
			},
			async actionValueChange(action, $event) {
				if (this.batch) {
					uni.navigateTo({
						url: "/pages/device/select",
						events: {
							devices: (devices) => {
								if (devices.length == 0)
									return

								uni.showLoading({
									title: "执行中"
								})

								this.batch_result = {
									total: devices.length,
									success: 0,
									fail: 0,
								}

								//console.log("get batches", devices)
								for (var index = 0; index < devices.length; index++) {
									var id = devices[index];
									post("device/" + id + "/action/" + action.name, {
										//[action.bind || "value"]: $event.detail.value
										name: action.label,
										value: $event.detail.value,
									}).then((res) => {
										console.log("batch then", res)
										this.checkBatchResult(true)
									}).catch(err => {
										console.log("batch catch", err)
										this.checkBatchResult(false)
									})
								}
							}
						}
					})
					return
				}

				console.log(action, $event.detail.value)
				let res = await post("device/" + this.id + "/action/" + action.name, {
					//[action.bind || "value"]: $event.detail.value
					name: action.label,
					value: $event.detail.value,
				})
				uni.showToast({
					icon: 'success',
					title: "执行成功"
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
	.update {
		color: #828282;
		padding: 10rpx 20rpx;
	}

	.error {
		color: red;
		font-size: 18px;
		font-weight: bold;
		padding: 10rpx 20rpx;
	}

	.points {
		background-color: #393939;
	}

	.point {
		font-size: 16px;
		//color: black;
		//font-weight: bold;

		padding: 10rpx;


		//margin: 10rpx 0;
		.inner {
			background-color: #2f2f2f;
			//border: 1rpx solid #202939;
			border-radius: 8rpx;
			padding: 10rpx 20rpx;
			box-shadow: inset 1px 1px 5px #000;
		}

		.label {
			color: #bcbcbc;
			font-size: 14px;

			//禁止换行
			text-overflow: ellipsis;
			white-space: nowrap;
			overflow-x: hidden;
			width: 100%;
		}

		.value {
			text-align: center;
			//color: black;
			font-weight: bold;
			padding: 5px 0;
			font-size: 32px;
			text-shadow: 1px 1px 5px black;

		}

	}

	.action-button {
		font-size: 24px;
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
		color: #d8d8d8;
		background-color: #474747;

		border-radius: 10rpx;
		//border: 4rpx solid #cbcbcb;
		letter-spacing: 4rpx;

		--border-radius: 5px;
		box-shadow: inset -1px -1px 4px #000, -1px -1px 5px #000;
		--text-shadow: 1px 1px 5px #101010;
	}

	.action-label {
		margin-top: 20rpx;
		//color: black;
		color: #eaeaea;
		letter-spacing: 4rpx;
		text-shadow: 1px 1px 5px #000;
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

	.info-item {
		display: flex;
		align-items: center;
		margin: 10rpx 0;

		.info-label {
			font-weight: bold;
			color: #333;
			margin-right: 20rpx;
			min-width: 140rpx;
		}

		.info-value {
			color: #666;
			flex: 1;
			word-break: break-all;
		}
	}
</style>