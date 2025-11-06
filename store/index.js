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
			user: undefined,
			group: undefined
		};
	},
	actions: {
		setUser(user) {
			this.user = user
		},
		async getUser() {
			if (this.user) return this.user
			let res = await get("me")
			this.user = res.data
			return this.user
		},
		setGroup(group) {
			this.group = group
		},
		async getGroup() {
			if (this.group) return this.group
			let user = await this.getUser()
			//作为管理员
			let res = await post("table/group/search", {filter:{user_id: user.id}})
			if (res.data && res.data.length > 0) {
				this.group = res.data[0]
				return this.group
			}
			//作为成员的
			res = await post("table/member/search", {filter:{user_id: user.id}})
			if (res.data && res.data.length > 0) {
				let group_id = res.data[0].group_id
				res = await get("table/group/detail/"+group_id)
				this.group = res.data				
				return this.group
			}
			return undefined
		}
	},
});
