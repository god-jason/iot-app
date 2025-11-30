<template>
	<view>
		<uni-card :title="action.label||action.name">
			<uni-forms ref="form" :modelValue="formData" :label-width="100">
				<uni-forms-item v-for="(field, index) in action.parameters" :label="field.label" :name="field.key">
					<switch v-if="field.type=='switch'" :checked="formData[field.key]"
						@change="onChange($event, field.key)" />

					<uni-number-box v-else-if="field.type=='number'" type="number" v-model="formData[field.key]"
						:min="field.min||0" :max="field.max||1000" :step="field.step || 1"
						:placeholder="field.placeholder" />

					<uni-easyinput v-else-if="field.type=='text'" :type="field.type" v-model="formData[field.key]"
						:placeholder="field.placeholder" :maxlength="field.max || 256" />
				</uni-forms-item>
			</uni-forms>


			<button type="primary" @click="submit">执行</button>
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
				action: {},
				formData: {},
			}
		},
		onLoad(options) {
			this.id = options.id
			this.product_id = options.product_id
			this.index = options.index
			this.load()
		},
		methods: {
			async load() {
				let res = await getModel(this.product_id)
				let model = res || {
					actions: []
				}
				this.action = model.actions[this.index]
				console.log("action", this.action)

				//默认参数
				this.action.parameters.forEach(p => {
					switch (p.type) {
						case "switch":
							this.formData[p.key] = false
							break;
						case "number":
							this.formData[p.key] = 0
							break;
					}
				})

				//订阅响应
				subscribe("device/" + this.id + "/action/" + this.action.name + "/response", (topic, payload) => {
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
			async submit() {
				let res = await post("iot/device/" + this.id + "/action/" + this.action.name, this.formData)
				uni.showToast({
					icon: 'success',
					title: "执行成功"
				})
				//uni.navigateBack()
			},
			onChange($event, key) {
				this.formData[key] = $event.detail.value
			}
		}
	}
</script>

<style>

</style>