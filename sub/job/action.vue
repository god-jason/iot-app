<template>
	<view>
		<uni-list>
			<uni-list-item v-for="(p, k) in actions" :key="k" :title="p.label" clickable
				@click="open(p, k)"></uni-list-item>
		</uni-list>
	</view>
</template>

<script>
	import {
		getSetting
	} from '../../utils/model';
	export default {
		data() {
			return {
				product_id: '',
				batch: false,
				actions: [],
			};
		},
		onLoad(options) {
			this.eventChannel = this.getOpenerEventChannel();
			this.product_id = options.product_id
			this.loadAction()
		},
		methods: {
			async loadAction() {

				let res = await getSetting(this.product_id, "action")
				this.actions = []
				res.content.forEach(a => {
					this.actions.push(a)
				})
			},
			open(action, index) {
				if (action.type == "form" && action.parameters && action.parameters.length > 0) {
					uni.navigateTo({
						url: "/pages/device/action?product_id=" + this.product_id + "&index=" + index,
						events: {
							data: (data) => {
								this.eventChannel.emit("action", {
									action: action.name,
									name: action.label,
									data: data,
								})
								uni.navigateBack()
							}
						},
						success: (res) => {
							//res.eventChannel.emit()
						},
					})
				} else if (action.type == "switch") {
					uni.showModal({
						title: "提示",
						content: "请选择开关操作",
						confirmText: "打开",
						cancelText: "关闭",
						success: (res) => {
							let data = {
								action: action.name,
								name: action.label,
								data: {
									value: false
								}
							}
							if (res.confirm) {
								data.name += "：打开"
								data.data.value = true
							} else {
								data.name += "：关闭"
							}
							this.eventChannel.emit("action", data)
							uni.navigateBack()
						}
					})
				} else {
					this.eventChannel.emit("action", {
						action: action.name,
						name: action.label,
					})
					uni.navigateBack()
				}
			}
		}




	}
</script>

<style>

</style>