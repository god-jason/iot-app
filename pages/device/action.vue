<template>
	<view class="page">
		<uni-card :title="action.label||action.name">
			<uni-forms ref="form" :modelValue="formData" :label-width="100">
				<uni-forms-item v-for="(field, index) in action.parameters" :label="field.label" :name="field.key">
					<switch v-if="field.type=='switch'" :checked="formData[field.key]"
						@change="onChange($event, field.key)" />

					<uni-number-box v-else-if="field.type=='number'" type="number" v-model="formData[field.key]"
						:min="field.min||0" :max="field.max||1000" :step="field.step || 1"
						:placeholder="field.placeholder" />

					<uni-easyinput v-else-if="field.type=='text' || field.type=='textarea'" :type="field.type"
						v-model="formData[field.key]" :placeholder="field.placeholder" :maxlength="field.max || 256" />

					<!-- 					<uni-data-select v-else-if="field.type=='select'" :localdata="field.localdata"
						v-model="formData[field.key]" placement="top" /> -->

					<slider v-if="field.type=='slider'" show-value :value="formData[field.key]" :min="field.min||0"
						:max="field.max||1000" :step="field.step || 1" @change="onChange($event, field.key)" />

					<picker v-else-if="field.type=='date'" mode="date" :value="formData[field.key]"
						@change="onChange($event, field.key)">
						<view>{{formData[field.key] || "0000-00-00"}}</view>
					</picker>

					<picker v-else-if="field.type=='time'" mode="time" :value="formData[field.key]"
						@change="onChange($event, field.key)">
						<view>{{formData[field.key] || "--:--"}}</view>
					</picker>

					<picker v-else-if="field.type=='select'" mode="selector" :range="field.localdata" range-key="name"
						@change="onSelectChange($event, field.key, field)">
						<view>
							{{field.index!=undefined ? field.localdata[field.index].name : '请选择'}}
						</view>
						<!-- <view style="word-break: break-all;">{{formData[field.key] || "点击选择"}}</view> -->
					</picker>

				</uni-forms-item>
			</uni-forms>


			<button type="primary" @click="submit">执行</button>
		</uni-card>
	</view>
</template>

<script>
	import {
		getSetting
	} from '../../utils/model';
	import {
		get,
		post
	} from '../../utils/request'

	export default {
		data() {
			return {
				id: undefined,
				devices: [],
				action: {},
				formData: {},
				batch_result: {}
			}
		},
		onLoad(options) {
			this.id = options.id
			this.product_id = options.product_id
			this.index = options.index
			this.load()

			const eventChannel = this.getOpenerEventChannel();
			eventChannel.on('devices', (data) => {
				console.log("devices", data)
				this.devices = data
			})
		},
		methods: {
			async load() {
				let res = await getSetting(this.product_id, "action")
				let model = res || {
					content: []
				}
				this.action = model.content[this.index]
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
						case "slider":
							this.formData[p.key] = 0
							break;
						case "select":
							p.index = undefined //清空历史记录							
							if (p.data_api) {
								get(p.data_api).then(res => {
									p.localdata = res.data
								})
							}
							break;
					}
				})
			},
			checkBatchResult(succ) {
				//console.log("checkbatch_result", succ)
				if (succ) this.batch_result.success++
				else this.batch_result.fail++
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
			async submit() {
				//中文名称
				this.formData.name = this.action.label

				if (this.devices && this.devices.length > 0) {
					uni.showLoading({
						title: "执行中"
					})

					this.batch_result = {
						total: this.devices.length,
						success: 0,
						fail: 0,
					}


					for (var index = 0; index < this.devices.length; index++) {
						var id = this.devices[index];
						post("device/" + id + "/action/" + this.action.name, this.formData)
							.then((res) => {
								console.log("batch_result then", res)
								this.checkBatchResult(true)
							}).catch(err => {
								console.log("batch_result catch", err)
								this.checkBatchResult(false)
							})
					}
					return
				}

				let res = await post("device/" + this.id + "/action/" + this.action.name, this.formData)
				uni.showToast({
					icon: 'success',
					title: "执行成功"
				})
				//uni.navigateBack()
			},
			onChange($event, key) {
				this.formData[key] = $event.detail.value
			},
			onSelectChange($event, key, field) {
				field.index = $event.detail.value
				this.formData[key] = field.localdata[$event.detail.value].value
			},
		}
	}
</script>

<style>

</style>