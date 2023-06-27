import api from "@/utils/api"
import { measurePatch, PATCH_COMMAND, PATCH_PATH } from '@/store/modules/measures'
import { measuresCount, MEASURES } from '@/store/modules/measures'
import STATUS from "./status";

export enum SNLIST {
    REQUEST = "SNLIST_REQUEST",
    SUCCESS = "SNLIST_SUCCESS",
    ERROR = "SNLIST_ERROR",
    MODIFY = "SNLIST_MODIFY", // обновить список SN для данного типа измерения
    MODIFY_ERROR = "SNLIST_MODIFY_ERROR",
}

export type ISNList = {
    id: number; // measuretypeid
    sn: number[]; // список SN у которых было данное измерение
    replace?: boolean; // при добавлении, существующий список будет заменен (или добавлен при replace = false)
}

interface IState extends ISNList {
    status: string;
}

const state: IState = {
    id: 0,
    sn: [],
    status: '',
}

const getters = {
    getSNList: (state: IState) => state.sn ? state.sn.join(", ") : '',
    getSNListAsColumn: (state: IState) => state.sn ? state.sn.join("\n") : '',
    getSNcount: (state: IState) => state.sn ? state.sn.length : 0,
    SNListStatus: (state: IState) => state.status,
    hasError: (state: IState) => state.status != STATUS.SUCCESS,
    SNListExecuting: (state: IState) => state.status == STATUS.DATA_LOADING, // признак того что выполняется запрос
};


async function getSnList(id: number): Promise<ISNList> {
    return new Promise((resolve, reject) => {
        api.get<ISNList>({ url: `/measures/${id}/snlist/` })
            .then(resp => {
                resolve(resp)
            })
            .catch(() => {
                const errMessage = api.statusText()
                reject(errMessage)
            });
    })
}

async function putSnList(id: number, list: number[], replace?: boolean): Promise<void> {
    const patchData: measurePatch[] = []

    patchData.push({
        op: replace ? PATCH_COMMAND.replace : PATCH_COMMAND.add,
        path: PATCH_PATH.snlist,
        value: list
    })

    return new Promise((resolve, reject) => {
        api.patch({ url: `/measures/${id}`, data: patchData })
            .then(() => {
                resolve()
            })
            .catch(() => {
                const errMessage = api.statusText()
                reject(errMessage)
            })
    })
}


const actions = {

    [SNLIST.REQUEST]: async ({ commit }, id: number) => {
        commit(SNLIST.REQUEST)
        try { commit(SNLIST.SUCCESS, await getSnList(id)) }
        catch (err) {
            commit(SNLIST.ERROR)
            throw Error(api.statusText())
        }
    },


    [SNLIST.MODIFY]: async ({ dispatch, commit, state }, data: ISNList) => {

        commit(SNLIST.REQUEST)

        try {
            await putSnList(data.id, data.sn, data.replace)
            await dispatch(SNLIST.REQUEST, state.id)

            // обновим число измерений у измерения state.id
            commit(MEASURES.UPDATE_COUNT,
                { id: state.id, count: state.sn.length } as measuresCount
            )
            // обновим статистику по измерению
            await dispatch(MEASURES.REQUEST_STATISTIC, state.id)
        }
        catch (err) {
            commit(SNLIST.MODIFY_ERROR)
            throw Error(api.statusText())
        }
    }
};


const mutations = {

    [SNLIST.REQUEST]: (state: IState) => {
        state.status = STATUS.DATA_LOADING
    },
    [SNLIST.SUCCESS]: (state: IState, resp: ISNList) => {
        state.status = STATUS.SUCCESS
        state.sn = resp.sn
        state.id = resp.id
    },
    [SNLIST.MODIFY_ERROR]: (state: IState) => {
        state.status = STATUS.ERROR
    },
    [SNLIST.ERROR]: (state: IState) => {
        state.status = STATUS.ERROR
        state.sn = []
        state.id = 0
    }
};


export default {
    state,
    mutations,
    actions,
    getters
};
