<template>
	<view>

		<uni-card>
			<uni-list :border="false">
				<uni-list-item v-for="(setting, index) in model.settings" :key="index"
					:title="setting.label||setting.name" show-arrow clickable
					@click="openSetting(index)"></uni-list-item>
			</uni-list>
		</uni-card>

	</view>
</template>
<script>
	import {
		getModel
	} from '../../utils/model'

	export default {
		data() {
			return {
				id: undefined,
				product_id: undefined,
				model: {}
			}
		},
		onLoad(options) {
			this.id = options.id
			this.product_id = options.product_id
			this.load()
		},
		methods: {
			async load() {
				this.model = await getModel(this.product_id)

			},
			openSetting(index) {
				uni.navigateTo({
					url: '/pages/device/setting?id=' + this.id + "&product_id=" + this.product_id + "&index=" +
						index
				})
			}
		}
	}
</script>

<style>

</style>