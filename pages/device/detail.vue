<template>
	<view>

		<!-- <ez-camera key="" secret="" sn="GA1719614" :channel="1"></ez-camera> -->

		<!-- 实时状态 -->
		<uni-card v-if="device" :title="device.name||'-'" :sub-title="device.id" :extra="device.online?'在线':'离线'"
			thumbnail="/static/device.png">
			<device-values @property-click="onPropertyClick($event)" :product="device.product_id" :device="device.id"
				type="detail"></device-values>
		</uni-card>

		<!-- 动作响应 -->
		<uni-card v-if="device">
			<uni-grid :column="2" :show-border="false" :square="false">
				<uni-grid-item v-for="(p, k) in actions" :key="k">
					<view v-if="p.type == 'button'" class="action-button" @click="actionClick(p)">{{p.label}}</view>

					<view v-else-if="p.type == 'switch'" class="action-button">
						<switch checked="true" @change="actionValueChange(p, $event)" />
						<text class="action-label">{{p.label}}</text>
					</view>

					<view v-else-if="p.type == 'slider'" class="action-button">
						<slider @change="actionValueChange(p, $event)" />
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
				<uni-list-item title="修改信息" note="" show-arrow clickable show-extra-icon
					:extra-icon="{color:'#1296db', size:'22', type:'compose'}">
				</uni-list-item>
			</uni-list>
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
		onPullDownRefresh() {
			this.load()
			uni.stopPullDownRefresh()
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
					//[action.bind || "value"]: $event.detail.value
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
						"&index=" + index
				})
			}
		}
	}
</script>

<style lang="scss">
	
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