import userService from '../service/user-service';
import { userConst } from '../const/entity-const';

export default {
	async list(c) {
		const { page, pageSize, email } = c.req.query;
		return await userService.listUsers(c, { page, pageSize, email });
	},

	async update(c) {
		const { userId } = c.req.param;
		const params = await c.req.json();
		return await userService.updateUser(c, userId, params);
	},

	async delete(c) {
		const { userId } = c.req.param;
		return await userService.deleteUser(c, userId);
	}
}; 