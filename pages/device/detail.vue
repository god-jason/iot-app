<template>
	<view>

		<ez-camera key="" secret="" sn="GA1719614" :channel="1"></ez-camera>

		<uni-card @click="open(device)" :title="device.name" :sub-title="device.id" :extra="device.online?'在线':'离线'"
			thumbnail="/static/device.png">
			<device-values @property-click="onPropertyClick(device, $event)" :device="device.id"
				:product="device.product_id" type="detail"></device-values>
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
				<uni-list-item title="历史曲线" note="" show-arrow clickable link="navigateTo" to="/pages/device/history">
				</uni-list-item>
				<uni-list-item title="参数配置" note="" show-arrow clickable link="navigateTo"
					to="/pages/device/parameters">
				</uni-list-item>
			</uni-list>
		</uni-card>

	</view>
</template>

<script>
	export default {
		data() {
			return {
				device: {
					id: "123123",
					name: '发电设备-003',
					online: true,
					switchStatus: 'on',
					updateTime: '2024-01-20 14:30:25'
				}
			}
		},
		methods: {
			onPropertyClick(device, property) {
				uni.navigateTo({
					url: "/pages/device/history?device_id=" + device.id + "&property=" + property.name
				})
			}
		}
	}
</script>

<style>

</style>