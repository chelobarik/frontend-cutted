// TODO BACKEND /api/researches

import api from "@/utils/api"
import Vue from "vue";
import STATUS from "@/store/modules/status"
import { IProfileGetters } from "@/store/modules/userProfile";

export enum RESEARCH {
    REQUEST = "RESEARCH_REQUEST",
    SUCCESS = "RESEARCH_SUCCESS",
    ERROR = "RESEARCH_ERROR",

    ADD_REQUEST = "RESEARCH_ADD_REQUEST",
    ADD_SUCCESS = "RESEARCH_ADD_SUCCESS",

    DEL_REQUEST = "RESEARCH_DEL_REQUEST",
    DEL_SUCCESS = "RESEARCH_DEL_SUCCESS",

    UPDATE_REQUEST = "RESEARCH_UPDATE_REQUEST",
    UPDATE_SUCCESS = "RESEARCH_UPDATE_SUCCESS",

    INIT = "RESEARCH_INIT",
    INIT_SUCCESS = "RESEARCH_INIT_SUCCESS",

}

export type researchItem = {
    id: number;
    name: string;
    owner: number;
    rwgroup: number;
}


interface IState {
    researches: researchItem[];
    status: string;
}

const state: IState = {
    researches: [
        // пример:
        // { id: 1, name: "Иванов А. А.", owner: 44, rwgroup: 1 },
        // { id: 2, name: "Петров И. И.", owner: 2, rwgroup: 1 },
    ],
    status: "",
}

const getters = {
    researches: (state: IState) => state.researches,
    getResearchName: (state: IState) => (id: number) => {
        const el = state.researches.find(el => el.id == id)
        return el ? el.name : ""
    },

    getResearch: (state: IState) => (id: number) => state.researches.find(el => el.id === id),

    // возвращает группу измерений, где текущий пользователь является владельцем
    getResearchByOwner: (state: IState, getters: IProfileGetters) => {

        let result: researchItem | undefined = undefined

        if (getters.isProfileLoaded) {
            const userID = getters.getProfile.id;
            result = state.researches.find(e => e.owner === userID)
        }

        return result
    }
};

const actions = {
    [RESEARCH.INIT]: async ({ commit }) => {
        commit(RESEARCH.REQUEST)

        return new Promise((resolve, reject) => {
            api.get<researchItem[]>({ url: "/researches" })
                .then(res => {
                    commit(RESEARCH.INIT_SUCCESS, res)
                    resolve(res)
                })
                .catch(() => {
                    const errMessage = api.statusText()
                    commit(RESEARCH.ERROR, errMessage)
                    reject(errMessage)
                })
        })
    },

    [RESEARCH.ADD_REQUEST]: async ({ commit }, r: researchItem) => {
        commit(RESEARCH.REQUEST)

        return new Promise((resolve, reject) => {
            api.post<number>({ url: "/researches", data: r })
                .then(res => {
                    r.id = res
                    commit(RESEARCH.ADD_SUCCESS, r)
                    resolve(r)
                })
                .catch(() => {
                    const errMessage = api.statusText({ 500: 'Ошибка на сервере, возможно группа с таким названием уже существует.' })
                    commit(RESEARCH.ERROR, errMessage)
                    reject(errMessage)
                })
        })
    },

    [RESEARCH.DEL_REQUEST]: async ({ commit }, id: number) => {
        const errMsg = {
            404: 'Не могу удалить. Группа не пустая!',
        }
        commit(RESEARCH.REQUEST)

        return new Promise((resolve, reject) => {
            api.delete({ url: "/researches/" + id })
                .then((res) => {
                    commit(RESEARCH.DEL_SUCCESS, id)
                    resolve(res)
                })
                .catch(() => {
                    const errMessage = api.statusText(errMsg)
                    commit(RESEARCH.ERROR, errMessage)
                    reject(errMessage)
                })
        })
    },

    [RESEARCH.UPDATE_REQUEST]: async ({ commit }, r: researchItem) => {
        commit(RESEARCH.REQUEST)

        return new Promise((resolve, reject) => {
            api.put({ url: `/researches/${r.id}`, data: r })
                .then((res) => {
                    commit(RESEARCH.UPDATE_SUCCESS, r)
                    resolve(res)
                })
                .catch(() => {
                    const errMessage = api.statusText()
                    commit(RESEARCH.ERROR, errMessage)
                    reject(errMessage)
                })
        })
    },


}

const mutations = {

    [RESEARCH.INIT_SUCCESS]: (state: IState, list: researchItem[]) => {
        state.status = STATUS.SUCCESS
        state.researches = list
    },

    [RESEARCH.REQUEST]: (state: IState) => {
        state.status = STATUS.DATA_LOADING
    },

    [RESEARCH.ERROR]: (state: IState, details: string | null) => {
        state.status = details ? `${STATUS.ERROR}. ${details}` : STATUS.ERROR
        console.log(state.status)
    },

    [RESEARCH.ADD_SUCCESS]: (state: IState, r: researchItem) => {
        state.status = STATUS.SUCCESS
        state.researches.push(r)
    },
    [RESEARCH.UPDATE_SUCCESS]: (state: IState, r: researchItem) => {
        state.status = STATUS.SUCCESS
        const index = state.researches.findIndex(el => el.id === r.id)
        if (index >= 0) {
            Vue.set(state.researches, index, r)
        }
    },


    [RESEARCH.DEL_SUCCESS]: (state: IState, id: number) => {
        const index = state.researches.findIndex(el => el.id === id)
        if (index >= 0) {
            Vue.delete(state.researches, index)
        }
    },
}

export default {
    state,
    getters,
    actions,
    mutations,
}