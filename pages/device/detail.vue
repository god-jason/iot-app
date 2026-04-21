<template>
	<view class="page">

		<view class="error" v-if="values.error_string || device.error_string" @click="clearError">
			错误：{{values.error_string || device.error_string}}
		</view>

		<!-- #ifndef MP-WEIXIN	-->
		<!-- <ez-camera sn="FR7033737" channel="1"></ez-camera> -->
		<!-- #endif	-->

		<view class="opers">
			<view class="oper" @click="editDevice">
				<uni-icons type="compose" size="30" color="white"></uni-icons>
				修改
			</view>
			<view class="oper" @click="openSettings" v-if="!device.gateway_id">
				<uni-icons type="settings-filled" size="30" color="white"></uni-icons>
				配置
			</view>
			<view class="oper" @click="job" v-if="!device.gateway_id">
				<uni-icons type="calendar" size="30" color="white"></uni-icons>
				定时
			</view>
			<!-- 			<view class="oper" @click="scene" v-if="!device.gateway_id">
				<uni-icons type="color" size="30" color="white"></uni-icons>
				场景
			</view> -->
			<view class="oper" @click="log" v-if="!device.gateway_id">
				<uni-icons type="info" size="30" color="white"></uni-icons>
				日志
			</view>
			<view class="oper" @click="child" v-if="!device.gateway_id && children">
				<uni-icons type="list" size="30" color="white"></uni-icons>
				设备
			</view>
		</view>


		<!-- 实时变量 -->
		<device-values v-if="device.product_id" :id="id" :product="device.product_id" :values="values"></device-values>
		<view class="update">
			更新时间：{{formatDateTime(values._update)}}
		</view>

		<!-- 动作响应 -->
		<view class="actions">
			<text class="title">设备操作</text>
			<label>
				批量
				<switch :checked="batch" @change="batch=$event.detail.value" />
			</label>
		</view>
		<device-actions v-if="device.product_id" :id="id" :product="device.product_id" :values="values" :batch="batch">
		</device-actions>

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
				actions: [],
				values: {},
				batch_result: {},
				children: 0
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
			subscribe() {
				//订阅变化
				subscribe("device/" + this.id + "/values", (topic, payload) => {
					Object.assign(this.values, payload)
					this.values._update = new Date()
				})
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
				this.loadValues()

				//网关设备，查询子设备数据
				if (!this.device.gateway_id) {
					res = await post("table/device/count", {
						filter: {
							gateway_id: this.device.id
						}
					})
					this.children = res.data || 0
				}
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
			openSettings() {
				uni.navigateTo({
					url: '/pages/device/settings?id=' + this.id + "&product_id=" + this.device.product_id
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
			},
			scene() {
				uni.navigateTo({
					url: '/sub/scene/scene?id=' + this.id + "&product_id=" + this.device.product_id
				})
			},
			job() {
				uni.navigateTo({
					url: '/sub/job/job?id=' + this.id + "&product_id=" + this.device.product_id
				})
			},
			child() {
				uni.navigateTo({
					url: '/pages/device/child?id=' + this.id
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.opers {
		background-color: #474747;
		display: flex;
		padding: 10rpx 20rpx;
	}

	.oper {
		flex: 1;
		display: flex;
		flex-direction: row;
		justify-content: left;
		align-items: center;
	}

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