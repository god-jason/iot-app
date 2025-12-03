import {
	defineStore
} from 'pinia';
import {
	get,
	post,
	request
} from '../utils/request';

export const userStore = defineStore('user', {
	state: () => {
		return {
			user: uni.getStorageSync("user"),
			group: uni.getStorageSync("group")
		};
	},
	actions: {
		setUser(user) {
			this.user = user
			uni.setStorageSync("user", user)
		},
		async getUser() {
			let res = await get("me")
			this.setUser(res.data)
		},
		setGroup(group) {
			this.group = group
			uni.setStorageSync("group", group)
		},
		async getGroup() {
			//获取用户
			if (!this.user)
				await this.getUser()

			//作为管理员
			let res = await post("table/group/search", {
				filter: {
					user_id: this.user.id
				}
			})
			if (res.data && res.data.length > 0) {
				this.setGroup(res.data[0])
				return
			}

			//作为成员的
			let res2 = await post("table/member/search", {
				filter: {
					user_id: this.user.id
				}
			})
			if (res2.data && res2.data.length > 0) {
				let group_id = res2.data[0].group_id
				res = await get("table/group/detail/" + group_id)
				this.setGroup(res.data)
				return
			}

			//

		},

		//返回 true 代表未变化
		async checkGroup() {
			let found = false
			
			//获取用户
			if (!this.user)
				await this.getUser()
			
			//获取用户
			if (!this.group) {
				await this.getGroup()
				return true
			}

			//作为管理员
			let res = await post("table/group/search", {
				filter: {
					user_id: this.user.id
				}
			})
			if (res.data && res.data.length > 0) {
				for (let index = 0; index < res.data.length; index++) {
					let group = res.data[index];
					if (this.group.id == group.id)
						found = true
				}
			}

			//作为成员的
			let res2 = await post("table/member/search", {
				filter: {
					user_id: this.user.id
				}
			})
			if (res2.data && res2.data.length > 0) {
				for (let index = 0; index < res2.data.length; index++) {
					let member = res2.data[index];
					if (this.group.id == member.group_id)
						found = true
				}
			}

			//找不到同ID
			if (!found) {

				//优先第一个
				if (res.data && res.data.length > 0) {
					this.setGroup(res.data[0])
					return true
				}

				if (res2.data && res2.data.length > 0) {
					let group_id = res2.data[0].group_id
					res = await get("table/group/detail/" + group_id)
					this.setGroup(res.data)
					return true
				}
				
				//置空
				this.setGroup(undefined)
				
				return true
			}
			
			//TODO

			return false
		},

		async refresh() {
			await getUser()
			await getGroup()
		}
	},
});