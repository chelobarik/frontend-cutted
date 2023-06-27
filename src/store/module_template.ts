// template для создания модуля store
import api from "@/utils/api"
import STATUS from "./modules/status"

export enum TEMPLATE {
  REQUEST = "TEMPLATE_REQUEST",
  SUCCESS = "TEMPLATE_SUCCESS",
  ERROR = "TEMPLATE_ERROR",
}

const getters = {
  data: (state: IState) => state.data,
}

type dataItem = {
  id: number;
  name: string;
}

interface IState {
  data: dataItem[]; // некоторый список
  status: string;
}

const defaultList = [
  "name1",
  "name2",
  "name3",
]

const state: IState = {
  status: "",
  data: defaultList.map((e, i) => ({ id: i, name: e } as dataItem))
}

const actions = {
  [TEMPLATE.REQUEST]: async ({ commit }) => {
    commit(TEMPLATE.REQUEST)

    return new Promise((resolve, reject) => {
      api.get<dataItem[]>({ url: "/dataitems" })
        .then(res => {
          commit(TEMPLATE.SUCCESS, res)
          resolve(res)
        })
        .catch(() => {
          const errMessage = api.statusText()
          commit(TEMPLATE.ERROR, errMessage)
          reject(errMessage)
        })
    })
  },
}

const mutations = {

  [TEMPLATE.REQUEST]: (state: IState) => {
    state.status = STATUS.DATA_LOADING
  },

  [TEMPLATE.ERROR]: (state: IState, details: string | null) => {
    state.status = details ? `${STATUS.ERROR}. ${details}` : STATUS.ERROR
    console.log(state.status)
  },


  [TEMPLATE.SUCCESS]: (state: IState, list: dataItem[]) => {
    state.status = STATUS.SUCCESS
    state.data = list
  },

}
export default {
  state,
  mutations,
  actions,
  getters,
}

