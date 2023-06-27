/*
  /api
      /measures  : GET - список всех типов измерений
            id, rgid, name, count, sn
      /measures  : POST - добавляет тип измерения
            id, rgid, name, count, sn
      /measures/{id} : GET - получить полные данные по измерению (включая список измерений sn)
      /measures/{id} : PATCH - переименовать измерение, или обновить другие данные (например, список измеренных людей sn)
      /measures/{id} : DELETE  - удалить

*/

import Vue from "vue"
import api from "@/utils/api"
import STATUS from "./status"
import { StatData, Statistic } from "@/utils/measureStat";

export enum MEASURES {
      REQUEST = "MEASURES_REQUEST",
      SUCCESS = "MEASURES_SUCCESS",
      ERROR = "MEASURES_ERROR",

      INIT = "MEASURES_INIT",
      INIT_SUCCESS = "MEASURES_INIT_SUCCESS",

      UPDATE_COUNT = "MEASURES_UPDATE_COUNT",

      ADD_REQUEST = "MEASURES_ADD_REQUEST",
      ADD_SUCCESS = "MEASURES_ADD_SUCCESS",

      DEL_REQUEST = "MEASURES_DEL_REQUEST",
      DEL_SUCCESS = "MEASURES_DEL_SUCCESS",

      RENAME_REQUEST = "MEASURES_RENAME_REQUEST",
      RENAME_SUCCESS = "MEASURES_RENAME_SUCCESS",

      REQUEST_STATISTIC = "MEASURES_REQUEST_STATISTIC",
      SUCCESS_STATISTIC = "MEASURES_SUCCESS_STATISTIC",
}

export type measureItem = {
      id: number;
      rgid: number;
      name?: string;
      short?: string;
      count?: number;
      readonly?: boolean;
      snList?: number[];
      stat?: StatData;
      description?: string;
}

// все поля, кроме 'id' изменяемые

export type measuresCount = {
      id: number;
      count: number;
}

export enum PATCH_COMMAND {
      remove = "remove",
      replace = "replace",
      add = "add",
}

export enum PATCH_PATH {
      snlist = "snList",
      name = "name",
      description = "description"
}

export type measurePatch = {
      op: PATCH_COMMAND;
      path: PATCH_PATH;
      value: number[] | string;
}

interface IState {
      measures: measureItem[]; // список всех типов измерений
      selected: measureItem | null; // какое тип измерений выбран
      status: string;
}

const state: IState = {
      status: "",
      selected: null,
      measures: [
            { id: 1, rgid: 1, name: "Мазок" },
            { id: 2, rgid: 1, name: "SNP" },
            { id: 3, rgid: 1, name: "Apoptosis A" },
            { id: 4, rgid: 1, name: "Apoptosis T" },
            { id: 5, rgid: 1, name: "Bank" },
            { id: 6, rgid: 1, name: "Immunology" },
            { id: 7, rgid: 1, name: "TCR" },
            { id: 8, rgid: 1, name: "Expression" },
            { id: 9, rgid: 2, name: "Факторы" },
            { id: 10, rgid: 2, name: "Диагноз" },
            { id: 11, rgid: 2, name: "ЭЭГ" },
            { id: 12, rgid: 2, name: "Психодиагностика" },
            { id: 13, rgid: 3, name: "Зубы" },
            { id: 14, rgid: 4, name: "Диагнозы ФИБ", short: "ФИБ" },
            { id: 15, rgid: 4, name: "Диагнозы ЕКР", short: "ЕКР" },
            { id: 16, rgid: 4, name: "Установлен диагноз ХЛБ", short: "ХЛБ" },
      ]
}

const getters = {
      measures: (state: IState) => state.measures,
      getMeasure: (state: IState) => (id: number) => {
            return state.measures.find(el => el.id == id)
      },
      getMeasureName: (state: IState) => (id: number) => {
            const el = state.measures.find(el => el.id == id)
            return el ? el.name : ""
      },
      getStat: (state: IState) => (id: number) => {
            const el = state.measures.find(el => el.id == id)
            return el?.stat
      },
};

const actions = {
      [MEASURES.ADD_REQUEST]: ({ commit }, mname: measureItem) => {
            commit(MEASURES.REQUEST)

            console.log('MEASURES.ADD, mname=', mname)

            return new Promise((resolve, reject) => {
                  api.post<number>({ url: "/measures", data: mname })
                        .then(res => {
                              console.log('MEASURES.ADD_SUCCESS, id=', res)
                              mname.id = res
                              commit(MEASURES.ADD_SUCCESS, mname)
                              resolve(res)
                        })
                        .catch(() => {
                              const errMessage = api.statusText({ 500: 'Ошибка на сервере, возможно измерение с таким названием уже существует.' })
                              commit(MEASURES.ERROR, errMessage)
                              reject(errMessage)
                        })
            })
      },

      [MEASURES.INIT]: async ({ commit }) => {
            commit(MEASURES.REQUEST)

            return new Promise((resolve, reject) => {
                  api.get<measureItem[]>({ url: "/measures" })
                        .then(res => {
                              commit(MEASURES.INIT_SUCCESS, res)
                              resolve(res)
                        })
                        .catch(() => {
                              const errMessage = api.statusText()
                              commit(MEASURES.ERROR, errMessage)
                              reject(errMessage)
                        })
            })
      },

      [MEASURES.DEL_REQUEST]: async ({ commit }, mname: measureItem) => {
            const errMsg = {
                  404: 'Не могу удалить. На сервере не найден такой тип измерений.',
            }
            commit(MEASURES.REQUEST)

            return new Promise((resolve, reject) => {
                  api.delete({ url: "/measures/" + mname.id })
                        .then((res) => {
                              commit(MEASURES.DEL_SUCCESS, mname)
                              resolve(res)
                        })
                        .catch(() => {
                              const errMessage = api.statusText(errMsg)
                              commit(MEASURES.ERROR, errMessage)
                              reject(errMessage)
                        })
            })
      },

      [MEASURES.RENAME_REQUEST]: async (
            { commit },
            { oldMeasure, newMeasure }:
                  { oldMeasure: measureItem; newMeasure: measureItem }) => {

            const errMsg = {
                  404: 'Не могу переименовать. На сервере такое измерение не найдено.'
            }

            commit(MEASURES.REQUEST)

            const patchData: measurePatch[] = []

            for (const key in newMeasure) {
                  if (key !== 'id' && newMeasure[key] !== undefined && newMeasure[key] !== oldMeasure[key])

                        if (key in PATCH_PATH) {
                              const emptyValue = typeof newMeasure[key] === 'string' && newMeasure[key].replace(/\s/g, '') === '';
                              patchData.push({
                                    op: PATCH_COMMAND.replace,
                                    path: PATCH_PATH[key],
                                    value: emptyValue ? null : newMeasure[key]
                              })
                        }
            }

            if (patchData.length == 0) {
                  console.error("Неверный вызов метода [MEASURES.RENAME_REQUEST")
                  return
            }

            console.log(patchData);


            return new Promise((resolve, reject) => {
                  api.patch({ url: "/measures/" + oldMeasure.id, data: patchData })
                        .then(res => {
                              commit(MEASURES.RENAME_SUCCESS, newMeasure)
                              resolve(res)
                        })
                        .catch(() => {
                              const errMessage = api.statusText(errMsg)
                              commit(MEASURES.ERROR, errMessage)
                              reject(errMessage)
                        })
            })

      },

      [MEASURES.REQUEST_STATISTIC]: async ({ commit }, id: number) => {
            commit(MEASURES.REQUEST)

            return new Promise((resolve, reject) => {
                  api.get<Statistic>({ url: `/measures/${id}/statistic` })
                        .then(res => {

                              const stat = new StatData(res)

                              commit(MEASURES.SUCCESS_STATISTIC, { id: id, stat: stat })
                              resolve(stat)
                        })
                        .catch(() => {

                              const errMessage = api.statusText()
                              commit(MEASURES.ERROR, errMessage)
                              reject(errMessage)
                        })
            })
      },

}


const mutations = {

      [MEASURES.UPDATE_COUNT]: (state: IState, mcount: measuresCount) => {
            const
                  index = state.measures.findIndex((el: measureItem) => el.id == mcount.id)

            if (index >= 0) {
                  const value = mcount.count ? mcount.count : 0
                  state.measures[index].count = value
                  console.log('count =  ', value)
            } else {
                  console.log('не найдено ')
            }
      },

      [MEASURES.REQUEST]: (state: IState) => {
            state.status = STATUS.DATA_LOADING
      },

      [MEASURES.DEL_SUCCESS]: (state: IState, mname: measureItem) => {

            const index = state.measures.findIndex(el => el.id == mname.id)

            if (index >= 0) {
                  if (state.selected?.id == mname.id) state.selected = null
                  Vue.delete(state.measures, index)
            }
      },

      [MEASURES.ADD_SUCCESS]: (state: IState, mname: measureItem) => {
            state.status = STATUS.SUCCESS
            state.measures.push(mname)
            state.selected = mname
      },

      [MEASURES.INIT_SUCCESS]: (state: IState, list: measureItem[]) => {
            state.status = STATUS.SUCCESS
            state.measures = list
            state.selected = list[0] ? list[0] : null
      },

      [MEASURES.ERROR]: (state: IState, details: string | null) => {
            state.status = details ? `${STATUS.ERROR}. ${details}` : STATUS.ERROR
            console.error(state.status)
      },

      [MEASURES.RENAME_SUCCESS]: (state: IState, res: measureItem) => {
            state.status = STATUS.SUCCESS
            const index = state.measures.findIndex(el => el.id == res.id)

            console.log('RENAME_SUCCESS:', res);

            if (index >= 0) {
                  for (const key in res) {
                        if (state.measures[index][key] !== res[key])
                              state.measures[index][key] = res[key]
                  }
            } else {
                  console.error('mutation MEASURES.RENAME_SUCCESS error, not found in array:', res.name)
            }
      },

      [MEASURES.SUCCESS_STATISTIC]: (state: IState, res: { id: number; stat: StatData }) => {

            state.status = STATUS.SUCCESS

            const m = state.measures.find(el => el.id === res.id);

            if (m) {
                  m.stat = res.stat
            }

      }
}



export default {
      state,
      mutations,
      actions,
      getters,
}

