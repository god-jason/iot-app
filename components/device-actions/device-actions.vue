<template>
	<view>
		<uni-grid :column="3" :show-border="false" :square="true">
			<uni-grid-item v-for="(p, k) in actions" :key="k" @click="open(p)">
				<view class="label">{{p.label}}</view>
			</uni-grid-item>
		</uni-grid>
	</view>
</template>

<script>
	import {
		getModel
	} from '../../utils/model';
	import {
		get
	} from '../../utils/request';

	export default {
		name: "device-actions",
		props: {
			product: String,
			device: String,
			//type: String,
		},
		data() {
			return {
				actions: [],
				//values: {}
			};
		},
		mounted() {
			getModel(this.product).then(res => {
				let model = res || {
					actions: []
				}
				this.actions = model.actions
				console.log("actions", model.actions)
			})
		},
		methods: {
			open(prop) {

			}
		}
	}
</script>

<style lang="scss" scoped>
	.label {}
</style>