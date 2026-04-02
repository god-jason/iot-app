<template>
	<view class="page">

		<uni-card>
			<uni-forms ref="form" :modelValue="formData" :label-width="100">
				<uni-forms-item v-for="(field, index) in setting.fields" :label="field.label" :name="field.key">
					<switch v-if="field.type=='switch'" :checked="formData[field.key]"
						@change="onChange($event, field.key)" />

					<uni-number-box v-else-if="field.type=='number'" type="number" v-model="formData[field.key]"
						:min="field.min||0" :max="field.max||1000" :step="field.step || 1"
						:placeholder="field.placeholder" />

					<uni-easyinput v-else-if="field.type=='text' || field.type=='textarea'" :type="field.type"
						v-model="formData[field.key]" :placeholder="field.placeholder" :maxlength="field.max || 256" />

					<uni-data-select v-else-if="field.type=='select'" :localdata="field.localdata"
						v-model="formData[field.key]" />

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

				</uni-forms-item>
			</uni-forms>
		</uni-card>

		<view class="buttons">
			<button type="default" @click="clear">清空内容</button>
			<button type="default" @click="batch">批量保存</button>
			<button type="primary" @click="submit">保存配置</button>
		</view>

	</view>
</template>

<script>
	import {
		checkMqtt,
		publish,
		subscribe,
		unsubscribe,
	} from '../../utils/broker'
	import {
		getSetting
	} from '../../utils/model'
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
				product_id: undefined,
				setting: {},
				index: 0,
				formData: {},
				batch_result: {}
			}
		},
		computed: {
			...mapState(userStore, ['user', 'group']),
		},
		onLoad(options) {
			this.id = options.id
			this.product_id = options.product_id
			this.index = options.index
			this.load()
		},
		onUnload() {
			unsubscribe("device/" + this.id + "/setting/" + this.setting.name + "/read/response")
		},
		methods: {
			sleep(ms) {
				return new Promise(resolve => setTimeout(resolve, ms))
			},
			async load() {
				let model = await getSetting(this.product_id, "setting")

				this.setting = model.content.filter(s => this.user.admin || !s.hidden)[this.index]
				//this.setting.multiple = true //TODO 测试用，需要删除

				this.setting.fields.forEach(f => {
					if (f.type == "select" && !f.localdata) {
						f.localdata = f.options.map(o => {
							return {
								text: o.label,
								value: o.value
							}
						})
					}
					//默认值
					if (f.type == "number" || f.type == "slider") {
							this.formData[f.key] = f.min || f.default || 0
					}
				})
				console.log("setting form", this.setting)

				uni.setNavigationBarTitle({
					title: this.setting.label || this.setting.name
				})

				let res = await get("device/" + this.id + "/setting/" + this.setting.name)
				console.log("原始配置", res.data)
					//this.formData = res.data || {}
					Object.assign(this.formData, res.data)

				//TODO 需要取消订阅
				subscribe("device/" + this.id + "/setting/" + this.setting.name + "/read/response", (topic,
					payload) => {
					Object.assign(this.formData, payload)
					//this.formData = payload
				})
				publish("device/" + this.id + "/setting/" + this.setting.name + "/read", "{}")

			},
			clear(){
				this.formData = {}
				this.setting.fields.forEach(f => {
					//默认值
					if (f.type == "number" || f.type == "slider") {
							this.formData[f.key] = f.min || f.default || 0
					}
				})
			},
			async submit() {
				// 小程序端存在表单数据未及时同步的问题：延迟 200ms 再读取/提交
				await this.sleep(200)
				//publish("device/"+this.id+"/setting/"+this.setting.name, this.formData)
				let data = this.formData
				let res = await post("device/" + this.id + "/setting/" + this.setting.name, data)

				//uni.navigateBack()
				uni.showToast({
					title: "保存成功",
					icon: "success"
				})
			},

			checkBatch(succ) {
				console.log("checkBatch", succ)
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

			async batch() {
				// 小程序端存在表单数据未及时同步的问题：延迟 200ms 再读取/提交
				await this.sleep(200)

				uni.navigateTo({
					url: "/pages/device/select",
					events: {
						devices: (devices) => {
							if (devices.length == 0)
								return

							uni.showLoading({
								title: "执行中"
							})

							this.batch_result = {
								total: devices.length,
								success: 0,
								fail: 0,
							}

							let data = this.formData

							//console.log("get batches", devices)
							for (var index = 0; index < devices.length; index++) {
								var id = devices[index];
								post("device/" + id + "/setting/" + this.setting.name, data).then((
									res) => {
									console.log("batch then", res)
									this.checkBatch(true)
								}).catch(err => {
									console.log("batch catch", err)
									this.checkBatch(false)
								})
							}
						}
					}
				})
			},

			onChange($event, key) {
				this.formData[key] = $event.detail.value
			},
		}
	}
</script>

<style lang="scss" scoped>
	// picker{
	// 	display: flex;
	// 	flex-direction: row;
	// 	//justify-content: center;
	// 	align-items: center;
	// }
	.buttons{
		padding: 20px;
		display: flex;
	}
</style>