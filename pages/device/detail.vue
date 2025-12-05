<template>
	<view>

		<!-- <ez-camera key="" secret="" sn="GA1719614" :channel="1"></ez-camera> -->

		<!-- 实时状态 -->
		<uni-card v-if="device" :title="device.name||'-'" :sub-title="device.id" :extra="device.online?'在线':'离线'"
			thumbnail="/static/device.png">
			
			<view v-for="(p, k) in model.properties" :key="k">
				<uni-grid :column="3" :show-border="false" :square="false">
					<uni-grid-item v-for="(p, k) in p.points" :key="k">
						<view class="point" @click="onPropertyClick(p)">
							<view class="label">{{p.label}}{{p.unit}}</view>
							<view class="value">{{values.hasOwnProperty(p.name) ? values[p.name] : '-'}}</view>
						</view>
					</uni-grid-item>
				</uni-grid>
			</view>

			<view class="">
				更新时间：{{fromNow(values._update)}}
			</view>
		</uni-card>

		<!-- 动作响应 -->
		<uni-card v-if="device">
			<uni-grid :column="2" :show-border="false" :square="false">
				<uni-grid-item v-for="(p, k) in model.actions" :key="k">
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
		</uni-card>

		<uni-card>
			<uni-list :border="false">
				<uni-list-item title="历史曲线" note="" show-arrow clickable link="navigateTo" to="/pages/device/history"
					show-extra-icon :extra-icon="{color:'#1296db', size:'22', type:'bars'}">
				</uni-list-item>
				<uni-list-item title="参数配置" note="" show-arrow clickable @click="openSettings" show-extra-icon
					:extra-icon="{color:'#1296db', size:'22', type:'settings-filled'}">
				</uni-list-item>
				<uni-list-item title="修改信息" note="" show-arrow clickable show-extra-icon @click="editDevice"
					:extra-icon="{color:'#1296db', size:'22', type:'compose'}">
				</uni-list-item>
				<uni-list-item title="操作日志" note="" show-arrow clickable show-extra-icon
					:extra-icon="{color:'#1296db', size:'22', type:'info'}">
				</uni-list-item>
			</uni-list>
		</uni-card>
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
		get,
		post
	} from '../../utils/request'

	export default {
		data() {
			return {
				id: undefined,
				device: undefined,
				model: {
					properties: [],
					actions: []
				},
				values: {}
			}
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
			fromNow(d){
				if (!d) return "--"
				return dayjs(d).fromNow()
			},
			async load() {
				let res = await get("table/device/detail/" + this.id)
				this.device = res.data;
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
					value: 60000,
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
				let res = await post("iot/device/" + this.id + "/action/" + action.name, {})
			},
			async actionValueChange(action, $event) {
				console.log(action, $event.detail.value)
				let res = await post("iot/device/" + this.id + "/action/" + action.name, {
					//[action.bind || "value"]: $event.detail.value
					value: $event.detail.value,
				})
			},
			actionForm(action, index) {
				uni.navigateTo({
					url: "/pages/device/action?id=" + this.id + "&product_id=" + this.device.product_id +
						"&index=" + index
				})
			},
			editDevice() {
				uni.navigateTo({
					url: '/pages/device/edit?id=' + this.id
				});
			}
		}
	}
</script>

<style lang="scss">
	.point {
		text-align: center;
		font-size: 16px;
		color: black;
		//font-weight: bold;
	
		padding: 10rpx 0;
		//border: 1px solid #c0c0c0;
		margin: 10rpx 0;
	
		.label {
			font-size: 16px;
			text-overflow: ellipsis;
			overflow: hidden;
		}
	
		.value {
			color: black;
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
		border: 1px solid #c0c0c0;
		border-radius: 5px;
		background-color: #f0f0f0;
		//margin: 10rpx;
	}

	.action-label {
		margin-top: 20rpx;
		color: black;
	}
</style>