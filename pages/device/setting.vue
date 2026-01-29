<template>
	<view class="page">

		<uni-card :title="setting.label||setting.name">
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


			<button type="primary" @click="submit">保存</button>
			
		</uni-card>
		
		<uni-card>
			<button type="primary" @click="batch">批量保存</button>
		</uni-card>

	</view>
</template>

<script>
	import { checkMqtt, publish, subscribe } from '../../utils/broker'
import {
		getModel
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
			unsubscribe("device/"+this.id+"/setting/"+this.setting.name+"/read/response")
		},
		methods: {
			async load() {
				let model = await getModel(this.product_id)
				this.setting = model.settings.filter(s=>this.user.admin || !s.hidden)[this.index]
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

				let res = await get("iot/device/" + this.id + "/setting/" + this.setting.name)
				console.log("原始配置", res.data)
				Object.assign(this.formData, res.data)
				//this.formData = res.data || {};
				
				subscribe("device/"+this.id+"/setting/"+this.setting.name+"/read/response", (topic, payload)=>{
					Object.assign(this.formData, payload)
				})
				publish("device/"+this.id+"/setting/"+this.setting.name+"/read", "{}")
				
			},
			async submit() {
				publish("device/"+this.id+"/setting/"+this.setting.name, this.formData)
				let res = await post("iot/device/" + this.id + "/setting/" + this.setting.name, this.formData)
				//uni.navigateBack()
				uni.showToast({
					title: "保存成功",
					icon: "success"
				})
			},
			batch(){
				uni.navigateTo({
					url: "/pages/device/select",
					events: {
						devices: (devices) => {
							//console.log("get batches", devices)
							for (var index = 0; index < devices.length; index++) {
								var id = devices[index];
								post("iot/device/" + id + "/setting/" + this.setting.name,
								 this.formData).then(() => {})
							}
							uni.showToast({
								title: "批量保存成功",
								icon: "success"
							})
						}
					}
				})
			},

			onChange($event, key) {
				this.formData[key] = $event.detail.value
			}

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
</style>