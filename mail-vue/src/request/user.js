import http from '@/axios/index.js';

export function loginUserInfo() {
    return http.get('/user/loginUserInfo')
}

export function resetPassword(password) {
    return http.put('/user/resetPassword', {password})
}

export function userDelete() {
    return http.delete('/user/delete')
}

export function listUsers(params) {
    return http.get('/user/list', { params })
}

export function updateUser(userId, data) {
    return http.put(`/user/${userId}`, data)
}

export function deleteUser(userId) {
    return http.delete(`/user/${userId}`)
}