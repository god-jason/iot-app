<template>
	<view class="page">

		<uni-card>
			<uni-list :border="false">
				
				<uni-list-item v-for="(setting, index) in model.settings.filter(s=>user.admin || !s.hidden)"
				 :key="index"
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
	import {
		mapState
	} from 'pinia';
	import {
		userStore
	} from '../../store';

	export default {
		data() {
			return {
				id: undefined,
				product_id: undefined,
				model: {}
			}
		},
		computed: {
			...mapState(userStore, ['user', 'group']),
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