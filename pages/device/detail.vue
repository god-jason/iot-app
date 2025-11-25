<template>
	<view>

		<!-- <ez-camera key="" secret="" sn="GA1719614" :channel="1"></ez-camera> -->

		<!-- 实时状态 -->
		<uni-card v-if="device" :title="device.name||'-'" :sub-title="device.id" :extra="device.online?'在线':'离线'"
			thumbnail="/static/device.png">
			<device-values @property-click="onPropertyClick($event)" :product="device.product_id" :device="device.id"
				type="detail"></device-values>
		</uni-card>

		<uni-card>
			<uni-list :border="false">
				<uni-list-item title="历史曲线" note="" show-arrow clickable link="navigateTo" to="/pages/device/history"
					show-extra-icon :extra-icon="{color:'#1296db', size:'22', type:'bars'}">
				</uni-list-item>
				<uni-list-item title="参数配置" note="" show-arrow clickable @click="openSettings" show-extra-icon
					:extra-icon="{color:'#1296db', size:'22', type:'settings-filled'}">
				</uni-list-item>
			</uni-list>
		</uni-card>

		<!-- 动作响应 -->
		<uni-card v-if="device">
			<uni-grid :column="3" :show-border="false" :square="true">
				<uni-grid-item v-for="(p, k) in actions" :key="k">

					<button v-if="p.type == 'button'" type="default" class="action-button"
						@click="actionClick(p)">{{p.label}}</button>

					<view v-else-if="p.type == 'switch'" class="action-button">
						<switch checked="true" @change="actionValueChange(p, $event)" />
						{{p.label}}
					</view>

					<view v-else-if="p.type == 'slider'" class="action-button">
						<slider @change="actionValueChange(p, $event)" />
						{{p.label}}
					</view>

					<button v-else-if="p.type == 'form'" type="default" class="action-button"
						@click="actionForm(p, k)">{{p.label}}</button>

					<button v-else type="default" class="action-button" @click="actionClick(p)">{{p.label}}</button>
				</uni-grid-item>
			</uni-grid>
		</uni-card>

	</view>
</template>

<script>
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
				actions: []
			}
		},
		onLoad(options) {
			this.id = options.id
			this.load()
		},
		methods: {
			async load() {
				let res = await get("table/device/detail/" + this.id)
				this.device = res.data;
				this.loadAction()
			},
			async loadAction() {
				let res = await getModel(this.device.product_id)
				let model = res || {
					actions: []
				}
				this.actions = model.actions
				//console.log("actions", model.actions)
			},
			onPropertyClick(property) {
				uni.navigateTo({
					url: "/pages/device/history?device_id=" + this.device.id + "&property=" + property.name
				})
			},
			openSettings() {
				uni.navigateTo({
					url: '/pages/device/settings?id=' + this.id + "&product_id=" + this.device.product_id
				})
			},
			async actionClick(action) {
				let res = await post("iot/device/" + this.id + "/action/" + action.name, {})
				uni.showToast({
					icon: 'success',
					title: "执行成功"
				})
			},
			async actionValueChange(action, $event) {
				console.log(action, $event.detail.value)
				let res = await post("iot/device/" + this.id + "/action/" + action.name, {
					[action.bind || "value"]: $event.detail.value
				})
				uni.showToast({
					icon: 'success',
					title: "执行成功"
				})
			},
			actionForm(action, index) {
				uni.navigateTo({
					url: "/pages/device/action?id=" + this.id + "&product_id=" + this.device.product_id +
						"&index=" + index
				})
			}
		}
	}
</script>

<style>
	.action-button {
		font-size: 32rpx;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
</style>