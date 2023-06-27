import { USER_REQUEST } from "../actions/user"
import api from "@/utils/api"
import STATUS from "./status"
import AUTH from "../actions/auth";

export interface IUser {
  user: string;
  password: string;
}

type AuthResult = {
  clientID: string;
}

interface IState {
  token: string;
  status: string;
  hasLoadedOnce: boolean;
}

const state: IState = {
  token: localStorage.getItem("user-token") || "",
  status: "",
  hasLoadedOnce: false
};

const getters = {
  isAuthenticated: (state: IState): boolean => !!state.token,
  authStatus: (state: IState): string => state.status
};

const actions = {

  [AUTH.REQUEST]: async ({ commit, dispatch }, user: IUser) => {
    commit(AUTH.REQUEST);

    return new Promise((resolve, reject) => {
      api.dial<AuthResult>({ url: "/auth", data: user, method: "POST" })
        .then(res => {
          const r = res as AuthResult
          localStorage.setItem("user-token", r.clientID);
          api.token = r.clientID
          commit(AUTH.SUCCESS, r)
          dispatch(USER_REQUEST)
          resolve(res)
        })
        .catch(() => {
          const errMessage = api.statusText({ 400: 'Неверный пользователь или пароль.' })
          commit(AUTH.ERROR, errMessage)
          localStorage.removeItem("user-token")
          api.token = ""
          reject(errMessage)
        })
    })

  },

  [AUTH.LOGOUT]: ({ commit }): Promise<void> => {
    return new Promise(
      resolve => {
        commit(AUTH.LOGOUT);
        localStorage.removeItem("user-token");
        resolve();
      }
    );
  }
}

const mutations = {
  [AUTH.REQUEST]: (state: IState) => {
    state.status = STATUS.DATA_LOADING
  },
  [AUTH.SUCCESS]: (state: IState, resp: AuthResult) => {
    state.status = STATUS.SUCCESS
    state.token = resp.clientID
    state.hasLoadedOnce = true
  },
  [AUTH.ERROR]: (state: IState, statusText: string) => {
    state.token = ""
    state.status = statusText
    state.hasLoadedOnce = true
  },
  [AUTH.LOGOUT]: (state: IState) => {
    state.status = STATUS.ERROR
    state.token = ""
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
