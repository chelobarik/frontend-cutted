// работа со статусом человека и регистром

import api from "../../utils/api"
import STATUS from "./status"
import { isEqualSearch } from "@/utils/parse";
import { exposeTypeList } from "@/static/exposeType";

export enum REGISTR {
    INIT_REQUEST = "REGISTR_INIT_REQUEST",
    INIT_SUCCESS = "REGISTR_INIT_SUCCESS",

    FAMLIST_REQUEST = "FAMLIST_REQUEST", // загрузить список фамилий и их кодов
    FAMLIST_SUCCESS = "FAMLIST_SUCCESS",

    SEARCH_REQUEST = "SEARCH_REQUEST", // поиск по фам. им. отч. sn году рожд
    SEARCH_SUCCESS = "SEARCH_SUCCESS",

    SET_SEARCH_TEXT = "SET_SEARCH_TEXT", // установить строку поиска

    SN_STATUS_REQUEST = "SN_STATUS_REQUEST",
    SN_STATUS_SUCCESS = "SN_STATUS_SUCCESS",

    REQUEST = "REGISTR_REQUEST_DATA",
    ERROR = "REGISTR_ERROR",
}

const lifeStatusTitle = ["", "жив", "?", "умер"];


const diagnoses = [
    { id: 14, title: 'ФИБ' },
    { id: 15, title: 'ЕКР' },
    { id: 16, title: 'ХЛБ' },
]


export type mtype = {
    id: number;
    rgid: number;
    mname: string;
    rgname: string;
}

export type snStatusItem = {
    sn?: number;
    isvalid?: true;
    exposgroup?: number;
    lifestatus?: number;
    yearoflifestatus?: number;
    mtypeid?: mtype[];
}

type measureItem = {
    mID: number;
    title: string;
}

type researchItem = {
    rgID: number;
    name: string;
    child?: measureItem[];
}

export type FamListType = {
    surcod: number[];
    sur: string[];
}

export type snStatusType = {
    sn?: number;
    exposeGroup?: string;
    lifeStatus: { title: string; year?: number };
    measures: researchItem[];
    diagnoses: string[];
}

export type searchType = {
    fam?: string;
    name?: string;
    otch?: string;
    sn?: string;
    year?: string;
}

export type registrType = {
    sn: number;
    sex: boolean; // true = женский пол
    sur1code: number;
    sur2code: number;
    sur3code: number;
    namcod: number;
    fnamcod: number;
    fullbirthdate: boolean;
    sur1: string;
    sur2: string;
    sur3: string;
    nam: string; // имя
    fnam: string; // отчество
    exposgroup: number;
    lifestatus: number; //  1 - жив, 3 - мертв, null - неизвестно
    yearoflifestatus: number; // 0 - неизвестно
    sur: string; // последняя фамилия - вычисляемое на основе sur1, sur2 и sur3 - на сервере
    byear: number; // год рождения
    bdate: string; // дата рождения в формате DD.MM.YYYY или год рождения - YYYY, если дата не полная

}

interface IState {
    snStatus: snStatusType;
    status: string;
    sn?: Set<number>;
    famList?: FamListType;
    searchResults?: registrType[];  // результаты поиска
    searchText: string; // строка поиска
    search: searchType;
}

const state: IState = {
    snStatus: { lifeStatus: { title: "" }, measures: [], diagnoses: [] },
    status: "",
    searchText: "",
    search: {},
    searchResults: undefined,
};

const getters = {
    registr: (state: IState) => state.sn,
    registrLoaded: (state: IState) => state.sn && state.sn.size > 0,
    getSnStatus: (state: IState) => state.snStatus,
    famList: (state: IState) => state.famList,
    regSrch: (state: IState) => state.searchResults,
    regSrchText: (state: IState) => state.searchText,
};


function uri(s: searchType): string {
    const objectKeys = Object.keys(s).map(e => `${e}=${(s[e])}`);
    return objectKeys.join("&")
}


const actions = {

    [REGISTR.SN_STATUS_REQUEST]: async ({ commit }, sn: number) => {
        commit(REGISTR.REQUEST)

        return new Promise((resolve, reject) => {
            api.get<snStatusItem>({ url: `/status/${sn}` })
                .then(res => {
                    res.sn = sn
                    commit(REGISTR.SN_STATUS_SUCCESS, res)
                    resolve(res)
                })
                .catch(() => {
                    const errMessage = api.statusText()
                    commit(REGISTR.ERROR, errMessage)
                    reject(errMessage)
                })
        })

    },

    [REGISTR.INIT_REQUEST]: async ({ commit }) => {
        commit(REGISTR.REQUEST)
        return new Promise((resolve, reject) => {
            api.get<number[]>({ url: '/sn' })
                .then(res => {
                    commit(REGISTR.INIT_SUCCESS, res)
                    resolve(res)
                })
                .catch(() => {
                    const errMessage = api.statusText()
                    commit(REGISTR.ERROR, errMessage)
                    reject(errMessage)
                })
        })

    },
    [REGISTR.FAMLIST_REQUEST]: async ({ commit }) => {
        commit(REGISTR.REQUEST)
        return new Promise((resolve, reject) => {
            api.get<FamListType>({ url: '/famlist' })
                .then(res => {
                    commit(REGISTR.FAMLIST_SUCCESS, res)
                    resolve(res)
                })
                .catch(() => {
                    const errMessage = api.statusText()
                    commit(REGISTR.ERROR, errMessage)
                    reject(errMessage)
                })
        })

    },
    [REGISTR.SEARCH_REQUEST]: async ({ commit, state }, searchQuery: searchType) => {
        commit(REGISTR.REQUEST)

        if (isEqualSearch(searchQuery, state.search) && state.searchResults) {
            return new Promise(resolve => resolve(state.searchResults))
        }

        return new Promise((resolve, reject) => {
            api.get<registrType[]>({ url: '/registr?' + uri(searchQuery) })
                .then(res => {
                    commit(REGISTR.SEARCH_SUCCESS, { data: res, query: searchQuery })
                    resolve(res)
                })
                .catch(() => {
                    const errMessage = api.statusText()
                    commit(REGISTR.ERROR, errMessage)
                    reject(errMessage)
                })
        })

    }
}


const mutations = {
    [REGISTR.REQUEST]: (state: IState) => {
        state.status = STATUS.DATA_LOADING
    },
    [REGISTR.SN_STATUS_SUCCESS]: (state: IState, res: snStatusItem) => {
        state.status = STATUS.SUCCESS

        state.snStatus.exposeGroup = res.exposgroup ? exposeTypeList[res.exposgroup] : "нет данных"

        state.snStatus.lifeStatus = res.lifestatus ?
            { title: lifeStatusTitle[res.lifestatus], year: res.yearoflifestatus } :
            { title: "нет данных" }

        const rgroups = res.mtypeid?.map(e => e.rgid),
            uniqueGroupID = [...new Set(rgroups)];

        state.snStatus.measures = []

        uniqueGroupID.forEach(rgid => {
            const child = res.mtypeid?.filter(e => e.rgid == rgid),
                rgname = child ? child[0].rgname : "";

            state.snStatus.measures.push({
                rgID: rgid,
                name: rgname,
                child: child?.map(e => ({ mID: e.id, title: e.mname }))
            })
        })

        const
            diagnosesSet = new Set(diagnoses.map(e => e.id)),

            diagnosesList =
                res.mtypeid?.filter(e => diagnosesSet.has(e.id))
                    .map(e => {
                        const dd = diagnoses.find(d => e.id == d.id);
                        return dd ? dd.title : ""
                    })

        state.snStatus.diagnoses = diagnosesList ? diagnosesList : []

    },
    [REGISTR.ERROR]: (state: IState, statusText: string) => {
        state.status = statusText
    },
    [REGISTR.INIT_SUCCESS]: (state: IState, res: number[]) => {
        state.status = STATUS.SUCCESS
        state.sn = new Set(res)
    },
    [REGISTR.FAMLIST_SUCCESS]: (state: IState, res: FamListType) => {
        state.status = STATUS.SUCCESS
        state.famList = res
    },
    [REGISTR.SEARCH_SUCCESS]: (state: IState, res: { data: registrType[]; query: searchType }) => {
        state.status = STATUS.SUCCESS
        state.searchResults = res.data
        state.search = res.query

    },
    [REGISTR.SET_SEARCH_TEXT]: (state: IState, s: string) => {
        state.searchText = s
    },

}

export default {
    state,
    getters,
    actions,
    mutations
};
