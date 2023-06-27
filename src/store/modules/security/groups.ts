// группы безопасности
//
// sys_groups
// sys_group_members
// sys_user

import Vue from "vue"
import api from "@/utils/api"
import STATUS from "../status"

export enum SEC {
    GROUPS_REQUEST = "SEC_GROUPS_REQUEST",
    USERS_REQUEST = "SEC_USERS_REQUEST",

    GROUPS_SUCCESS = "SEC_GROUPS_SUCCESS",
    USERS_SUCCESS = "SEC_USERS_SUCCESS",

    USER_ADD_REQUEST = "SEC_USER_ADD_REQUEST",
    USER_ADD_SUCCESS = "SEC_USER_ADD_SUCCESS",
    USER_ADD_ERROR = "SEC_USER_ADD_ERROR",

    USER_DEL_REQUEST = "SEC_USER_DEL_REQUEST",
    USER_DEL_SUCCESS = "SEC_USER_DEL_SUCCESS",
    USER_DEL_ERROR = "SEC_USER_DEL_ERROR",

    USER_RENAME_REQUEST = "SEC_USER_RENAME_REQUEST",
    USER_RENAME_SUCCESS = "SEC_USER_RENAME_SUCCESS",
    USER_RENAME_ERROR = "SEC_USER_RENAME_ERROR",

    ERROR = "SEC_ERROR",
    REQUEST = "SEC_REQUEST",
}

import { USER_UPDATE_PROFILE } from "@/store/actions/user";

type sysGroupsItem = {
    id: number;
    name: string;
    description: string | null;
}

export type sysUsersItem = {
    id: number;
    login?: string;
    name: string;
    password?: string;
    groupID?: number | null;
}

interface IState {
    groups: sysGroupsItem[];
    users: sysUsersItem[];
    status: string;
}

const state: IState = {
    groups: [],
    users: [],
    status: ""
};

const getters = {
    secGroups: (state: IState) => state.groups,
    secUsers: (state: IState) => state.users,
};

const actions = {

    [SEC.GROUPS_REQUEST]: async ({ commit }) => {
        commit(SEC.REQUEST)

        return new Promise((resolve, reject) => {
            api.get<sysGroupsItem[]>({ url: "/sec/groups" })
                .then(res => {
                    commit(SEC.GROUPS_SUCCESS, res)
                    resolve(res)
                })
                .catch(() => {
                    const errMessage = api.statusText()
                    commit(SEC.ERROR, errMessage)
                    reject(errMessage)
                })
        })

    },

    [SEC.USERS_REQUEST]: async ({ commit }) => {
        commit(SEC.REQUEST)

        return new Promise((resolve, reject) => {
            api.get<sysUsersItem[]>({ url: "/sec/users" })
                .then(res => {
                    commit(SEC.USERS_SUCCESS, res)
                    resolve(res)
                })
                .catch(() => {
                    const errMessage = api.statusText()
                    commit(SEC.ERROR, errMessage)
                    reject(errMessage)
                })
        })

    },

    [SEC.USER_ADD_REQUEST]: async ({ commit }, user: sysUsersItem) => {
        commit(SEC.REQUEST)

        return new Promise((resolve, reject) => {
            api.post<number>({ url: "/sec/users", data: user })
                .then(res => {
                    user.id = res
                    commit(SEC.USER_ADD_SUCCESS, user)
                    resolve(res)
                })
                .catch(() => {
                    const errMessage = api.statusText({ 500: 'Ошибка на сервере, возможно такой пользователь уже существует.' })
                    commit(SEC.ERROR, errMessage)
                    reject(errMessage)
                })
        })

    },

    [SEC.USER_DEL_REQUEST]: async ({ commit }, user: sysUsersItem) => {
        commit(SEC.REQUEST)

        return new Promise((resolve, reject) => {
            api.delete({ url: "/sec/users/" + user.id})
                .then(res => {
                    commit(SEC.USER_DEL_SUCCESS, user)
                    resolve(res)
                })
                .catch(() => {
                    const errMessage = api.statusText({ 404: 'Не могу удалить. На сервере такой пользователь не найден.' })
                    commit(SEC.ERROR, errMessage)
                    reject(errMessage)
                })
        })

    },

    [SEC.USER_RENAME_REQUEST]: async ({ commit, dispatch }, user: sysUsersItem) => {
        commit(SEC.REQUEST)

        return new Promise((resolve, reject) => {
            api.patch({ url: "/sec/users/" + user.id, data: user  })
                .then(res => {
                    console.log('action SEC.USER_RENAME_REQUEST success')
                    commit(SEC.USER_RENAME_SUCCESS, user)
                    dispatch(USER_UPDATE_PROFILE, user)
                    resolve(res)
                })
                .catch(() => {
                    const errMessage = api.statusText({ 404: 'Не могу переименовать. На сервере такой пользователь не найден.' })
                    commit(SEC.ERROR, errMessage)
                    reject(errMessage)
                })
        })

    },

}

const mutations = {
    [SEC.REQUEST]: (state: IState) => {
        state.status = STATUS.DATA_LOADING
    },
    [SEC.GROUPS_SUCCESS]: (state: IState, res: sysGroupsItem[]) => {
        state.status = STATUS.SUCCESS
        state.groups = res
    },
    [SEC.USERS_SUCCESS]: (state: IState, res: sysUsersItem[]) => {
        state.status = STATUS.SUCCESS
        state.users = res
    },
    [SEC.ERROR]: (state: IState, statusText: string) => {
        state.status = statusText
    },
    [SEC.USER_ADD_SUCCESS]: (state: IState, res: sysUsersItem) => {
        state.status = STATUS.SUCCESS
        state.users.push(res)
    },
    [SEC.USER_DEL_SUCCESS]: (state: IState, res: sysUsersItem) => {
        state.status = STATUS.SUCCESS
        const index = state.users.findIndex(el => el.id == res.id)
        if (index >= 0) {
            Vue.delete(state.users, index)
            console.info('mutation SEC.USER_DEL_SUCCESS, name:', res.name)
        } else {
            console.error('mutation SEC.USER_DEL_SUCCESS error, not found in array:', res.name)
        }
    },
    [SEC.USER_RENAME_SUCCESS]: (state: IState, res: sysUsersItem) => {
        state.status = STATUS.SUCCESS
        const index = state.users.findIndex(el => el.id == res.id)
        if (index >= 0) {
            state.users[index].name = res.name
            console.info('mutation SEC.USER_RENAME_SUCCESS, new name:', res.name)
        } else {
            console.error('mutation SEC.USER_RENAME_SUCCESS error, not found in array:', res.name)
        }
    }
}

export default {
    state,
    getters,
    actions,
    mutations
};
