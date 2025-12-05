<template>
	<view class="qrcode">
		<ikun-qrcode 
		    width="400"
		    height="400"
		    unit="rpx" 
		    color="#000000"
		    :data="user.id || 'no-id'"
		/>
	</view>
</template>

<script>
	import { mapState } from 'pinia';
	import { userStore } from '../../store';
	
	export default {
		data() {
			return {
				size: 300
			};
		},
		computed: {
			...mapState(userStore, ['user'])
		},
		onLoad() {
			
		},
		onReady() {
			
		},
		methods: {
			
		}
	}
</script>

<style lang="scss" scoped>
	.qrcode{
		display: flex;
		justify-content: center;
		align-items: center;
		padding-top: 100rpx;
	}
</style>