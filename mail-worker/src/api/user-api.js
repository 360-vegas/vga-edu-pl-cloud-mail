import app from '../hono/hono';
import userService from '../service/user-service';
import result from '../model/result';
import userContext from '../security/user-context';

// 先注册 /user/list，避免被通配路由覆盖
app.get('/user/list', async (c) => {
	// 管理员校验
	const user = await userService.loginUserInfo(c, await userContext.getUserId(c));
	if (user.type !== 0) {
		return c.json(result.fail('无权限'), 403);
	}
	const { page, pageSize, email } = c.req.query();
	const data = await userService.listUsers(c, { page, pageSize, email });
	return c.json(result.ok(data));
});

app.get('/user/loginUserInfo', async (c) => {
	const user = await userService.loginUserInfo(c, await userContext.getUserId(c));
	return c.json(result.ok(user));
});

app.put('/user/resetPassword', async (c) => {
	await userService.resetPassword(c, await c.req.json(), await userContext.getUserId(c));
	return c.json(result.ok());
});

app.delete('/user/delete', async (c) => {
	await userService.delete(c, await userContext.getUserId(c));
	return c.json(result.ok());
})




