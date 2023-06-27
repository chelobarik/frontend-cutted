import Vue from 'vue'
import Vuex from 'vuex'
import userProfile from "./modules/userProfile"
import auth from "./modules/auth"
import measures from "./modules/measures";
import researches from "./modules/researches"
import snList from "./modules/snList"
import secGroups from "./modules/security/groups"
import registr from "./modules/registr"
import facetedSearch from "./modules/facetedSearch"
Vue.use(Vuex)

const debug = process.env.NODE_ENV !== "production";

export type Options = {
  sn: { max: number; min: number }; // максимальное и минимальное возможное значение для SN, нужно потом брать из базы, используется при валидации форм
}

interface IState {
  options: Options;
}

export default new Vuex.Store({
  state: {
    options: {
      sn: { max: 7531070, min: 19 }
    }
  } as IState,

  getters: {
    getOptions: (state: IState) => state.options,
  },

  modules: {
    userProfile,
    auth,
    measures,
    researches,
    snList,
    secGroups,
    registr,
    facetedSearch,
  },
  strict: debug
})



