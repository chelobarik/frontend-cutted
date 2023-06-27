import {
  USER_REQUEST,
  USER_ERROR,
  USER_SUCCESS,
  USER_UPDATE_PROFILE,
} from "../actions/user";

import Vue from "vue";
import AUTH from "../actions/auth";
import api from "@/utils/api";
import { sysUsersItem } from "./security/groups";
import STATUS from "./status";


interface IState {
  status: string;
  profile: sysUsersItem;
}

const newProfile = (user: sysUsersItem | null) => ({ name: "", login: "", id: 0, ...user })

const state: IState = {
  status: "",
  profile: newProfile(null)
};


export interface IProfileGetters {
  getProfile: sysUsersItem;
  isProfileLoaded: boolean;
}


const getters = {
  getProfile: (state: IState) => state.profile,
  isProfileLoaded: (state: IState) => !!state.profile.name,
  isAdmin: (state: IState) => !!state.profile.name && state.profile.id == 1,
};

const actions = {
  [USER_REQUEST]: async ({ commit, dispatch }) => {
    commit(USER_REQUEST)

    return new Promise((resolve, reject) => {
      api.get<sysUsersItem>({ url: "/userprofile" })
        .then(res => {
          commit(USER_SUCCESS, res)
          resolve(res)
        })
        .catch(() => {
          const errMessage = api.statusText()
          commit(USER_ERROR, errMessage)
          dispatch(AUTH.LOGOUT)
          reject(errMessage)
        })
    })
  },

  [USER_UPDATE_PROFILE]: ({ commit, state }, user: sysUsersItem) => {
    // текущий профаил загружен и соответсвует пользователю, тогда обновим его
    if (state.profile.id && user.id == state.profile.id) {
      commit(USER_SUCCESS, newProfile(user))
    }
  },


};

const mutations = {
  [USER_REQUEST]: (state: IState) => {
    state.status = STATUS.DATA_LOADING
  },
  [USER_SUCCESS]: (state: IState, resp: sysUsersItem) => {
    state.status = STATUS.SUCCESS
    Vue.set(state, "profile", resp)
  },
  [USER_ERROR]: (state: IState) => {
    state.status = STATUS.ERROR
  },
  [AUTH.LOGOUT]: (state: IState) => {
    state.profile = newProfile(null)
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
