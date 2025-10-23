<template>
	<view>
		<uni-search-bar placeholder="搜索" @confirm="search"></uni-search-bar>

		<uni-list>
			<uni-list-chat v-for="(user, index) in users" :key="user.id" :title="user.name"
				:avatar="user.avatar" avatar-circle
				clickable link="navigateTo" :to="'/pages/user/detail?id='+user.id">
			</uni-list-chat>
		</uni-list>
		
	</view>

</template>

<script>
	export default {
		data() {
			return {

				// 搜索关键词
				searchKeyword: '',

				// 模拟设备数据
				users: [{
						id: "123123",
						name: '张三',
						avatar: "/static/avatar.jpg",
					},
					{
						id: "123124",
						name: '李四',
						avatar: "/static/avatar.jpg",
					},
					{
						id: "123125",
						name: '王五',
						avatar: "/static/avatar.jpg",
					}
				]
			}
		},
		onPullDownRefresh() {
			uni.stopPullDownRefresh()
			//TODO 加载
		},
		onReachBottom() {
			console.log("bottom")
			//TODO 加载更多
		},
		mounted() {
			//TODO 加载
		},
		methods: {
			open(user) {
				uni.navigateTo({
					url: "/pages/user/detail?id=" + user.id,
				})
			},

		}
	}
</script>

<style lang="scss" scoped>
</style>