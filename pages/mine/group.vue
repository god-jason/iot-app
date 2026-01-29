<template>
	<view class="page">

		<uni-card v-for="(g, index) in groups" :title="g.name" :key="g.id"
		:extra="g.id==group.id?'当前选择':''"	>
			<uni-list :border="false">
				<uni-list-item title="角色权限" :rightText="g.role"></uni-list-item>
				<uni-list-item title="成员管理" clickable show-arrow v-if="g.user_id==user.id"></uni-list-item>
			</uni-list>
			<view class="buttons">
				<button type="warn" size="mini" v-if="g.user_id!=user.id" @click="quitGroup(g)">退出</button>
				<button type="primary" size="mini" @click="switchGroup(g)">切换</button>
			</view>
		</uni-card>

		<view class="create-group">
			<button type="primary" @click="createGroup">创建组织</button>
		</view>
	</view>
</template>

<script>
	import {
		mapState
	} from 'pinia';
	import {
		userStore
	} from '../../store';
	import {
		get,
		post
	} from '../../utils/request';

	const user = userStore()

	export default {
		data() {
			return {
				groups: []
			}
		},
		computed: {
			...mapState(userStore, ['user', 'group']),
		},
		onLoad() {
			this.load()
		},
		methods: {
			async load(){
				this.loadOwns().then()
				this.loadMembers().then()
			},
			async loadOwns(){
				let res = await post("table/group/search", {
					filter: {
						user_id: this.user.id
					}
				})
				if (res.data && res.data.length > 0) {
					this.groups = res.data
					this.groups.forEach(group=>{
						group.role = "超级管理员"
					})
				}
			},
			async loadMembers() {
				

				//作为成员的
				let res2 = await post("table/member/search", {
					filter: {
						user_id: this.user.id
					}
				})
				if (res2.data && res2.data.length > 0) {
					for (let index = 0; index < res2.data.length; index++) {
						// let group_id = res2.data[index].group_id
						// let res = await get("table/group/detail/" + group_id)
						// let group = res.data
						// group.role = res2.data[index].role
						// this.groups.push(group)
						
						//以下方式数据不更新
						let group = res2.data[index]
						get("table/group/detail/" + group.group_id).then(res=>{
							Object.assign(group, res.data)
							this.groups.push(group)
						})
					}
				}
			},
			
			quitGroup(group){
				uni.showModal({
					title:"提示",
					content:"退出之前将无法访问该组织的任何数据",
					success: (res) => {
						if (res.confirm) {
							get('table/member/delete/'+group.id+'/'+this.user.id).then(()=>{
								this.load()
							})
						}
					}
				})
			},
			switchGroup(group){
				user.setGroup(group)
				uni.navigateBack()
			},

			// 创建组织
			createGroup() {
				uni.showModal({
					title: '创建组织',
					editable: true,
					placeholderText: '请输入组织名称',
					success: async (res) => {
						if (res.confirm) {
							const name = (res.content || '').trim()
							if (!name) {
								uni.showToast({
									title: '组织名称不能为空',
									icon: 'none'
								})
								return
							}

							try {
								const data = {
									name,
									user_id: this.user.id,
									disabled: false
								}
								const result = await post('table/group/create', data)
								if (result && (result.code === 0 || result.data)) {
									uni.showToast({
										title: '创建成功',
										icon: 'success'
									})
									// 重新加载组织列表
									this.load()
								} else {
									uni.showToast({
										title: (result && result.message) || '创建失败',
										icon: 'none'
									})
								}
							} catch (e) {
								uni.showToast({
									title: '创建失败，请稍后重试',
									icon: 'none'
								})
							}
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.buttons {
		//display: flex;
		//align-items: end;
		//justify-content: end;
		text-align: right;

		button {
			margin: 0 10rpx;
		}
	}
	.create-group {
		margin: 20rpx;
	}
</style>