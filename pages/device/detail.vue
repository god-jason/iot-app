<template>
	<view>

		<!-- <ez-camera key="" secret="" sn="GA1719614" :channel="1"></ez-camera> -->

		<uni-card v-if="device" :title="device.name" :sub-title="device.id" :extra="device.online?'在线':'离线'"
			thumbnail="/static/device.png">
			<device-values @property-click="onPropertyClick($event)" :product="device.product_id" :device="device.id"
				type="detail"></device-values>
		</uni-card>

		<uni-card>
			<uni-forms ref="form">
				<uni-forms-item label="开关">
					<switch checked="true" @change="" />
				</uni-forms-item>
				<uni-forms-item label="转速" name="">
					<slider :value="60" @change="" />
				</uni-forms-item>
			</uni-forms>
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

	</view>
</template>

<script>
	import {
		get
	} from '../../utils/request'

	export default {
		data() {
			return {
				id: undefined,
				device: undefined,
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
			}
		}
	}
</script>

<style>

</style>