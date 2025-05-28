import BizError from '../error/biz-error';
import accountService from './account-service';
import orm from '../entity/orm';
import user from '../entity/user';
import { eq, and, like, desc, sql } from 'drizzle-orm';
import { isDel } from '../const/entity-const';
import kvConst from '../const/kv-const';
import cryptoUtils from '../utils/crypto-utils';

const userService = {

	async loginUserInfo(c, userId) {
		let user = await userService.selectById(c, userId);
		let account = await accountService.selectByEmailIncludeDel(c, user.email);
		delete user.password;
		delete user.salt;
		user.accountId = account.accountId;
		user.type = c.env.admin === user.email ? 0 : 1;
		return user;
	},

	async resetPassword(c, params, userId) {
		const { password } = params;

		if (password < 6) {
			throw new BizError('密码不能小于6位');
		}
		const { salt, hash } = await cryptoUtils.hashPassword(password);
		await orm(c).update(user).set({ password: hash, salt: salt }).where(eq(user.userId, userId)).run();
	},

	selectByEmail(c, email) {
		return orm(c).select().from(user).where(
			and(
				eq(user.email, email),
				eq(user.isDel, isDel.NORMAL)))
			.get();
	},

	async insert(c, params) {
		const { userId } = await orm(c).insert(user).values({ ...params }).returning().get();
		return userId;
	},

	selectByEmailIncludeDel(c, email) {
		return orm(c).select().from(user).where(eq(user.email, email)).get();
	},

	selectById(c, userId) {
		return orm(c).select().from(user).where(
			and(
				eq(user.userId, userId),
				eq(user.isDel, isDel.NORMAL)))
			.get();
	},

	async delete(c, userId) {
		await orm(c).update(user).set({ isDel: isDel.DELETE }).where(eq(user.userId, userId)).run();
		await Promise.all([
			c.env.kv.delete(kvConst.AUTH_INFO + userId),
			accountService.removeByUserId(c, userId)
		]);
	},

	async listUsers(c, params) {
		const { page = 1, pageSize = 10, email = '' } = params;
		const offset = (page - 1) * pageSize;

		const query = orm(c).select().from(user)
			.where(and(
				eq(user.isDel, isDel.NORMAL),
				email ? like(user.email, `%${email}%`) : undefined
			))
			.orderBy(desc(user.createTime))
			.limit(pageSize)
			.offset(offset);

		const totalQuery = orm(c).select({ count: sql`count(*)` }).from(user)
			.where(and(
				eq(user.isDel, isDel.NORMAL),
				email ? like(user.email, `%${email}%`) : undefined
			));

		const [users, total] = await Promise.all([
			query.all(),
			totalQuery.get()
		]);

		// Remove sensitive information
		users.forEach(u => {
			delete u.password;
			delete u.salt;
		});

		return {
			list: users,
			total: total.count
		};
	},

	async updateUser(c, userId, params) {
		const { email, type, disabled } = params;
		
		// Check if email already exists
		if (email) {
			const existingUser = await userService.selectByEmailIncludeDel(c, email);
			if (existingUser && existingUser.userId !== userId) {
				throw new BizError('邮箱已被使用');
			}
		}

		const updateData = {};
		if (email !== undefined) updateData.email = email;
		if (type !== undefined) updateData.type = type;
		if (disabled !== undefined) updateData.disabled = disabled;

		await orm(c).update(user)
			.set(updateData)
			.where(eq(user.userId, userId))
			.run();
	},

	async deleteUser(c, userId) {
		await userService.delete(c, userId);
	}
};

export default userService;
