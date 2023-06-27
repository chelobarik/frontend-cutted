import api from "@/utils/api";
import cloneDeep from "lodash.clonedeep"
import STATUS from "./status";

export enum FACETED_SEARCH {
	REQUEST = "FACETED_SEARCH_REQUEST",  // фасетный поиск
	SUCCESS = "FACETED_SEARCH_SUCCESS",
	ERROR = "FACETED_SEARCH_ERROR",
}


type CheckboxItem = {
	enable: boolean;
	checkbox: string[];
}

type RadioItem = {
	enable: boolean;
	radio: string;
}

type RangeItem = {
	enable: boolean;
	from: string;
	to: string;
}

type IFacetedSearchDose = CheckboxItem & {
	acc: RangeItem;
	rate: RangeItem;
}

type IFacetedSearchPersonal = CheckboxItem & {
	sex: boolean;
	ethnic: boolean;
	age: RangeItem;
}

type IFacetedSearchLiveStatus = CheckboxItem & {
	status: boolean;
	date: RangeItem;
}

type IFacetedSearchContacts = CheckboxItem

type IFacetedSearchGroupExposed = CheckboxItem

type IFacetedSearchLocation = CheckboxItem

type IFacetedSearchParams = {
	enable: boolean;
	limit: string;
}

export type IFacetedSearchDiagnozItem = {
	enable: boolean;
	ekr: string;
	fib: string;
}

type IFacetedSearchDiagnoz = CheckboxItem & {
	absent: IFacetedSearchDiagnozItem;
	present: IFacetedSearchDiagnozItem;
	where: boolean;
}

// IFacetedSearch -----------------

export interface IFacetedSearchForm {
	searchParams: IFacetedSearchParams;
	liveStatus: IFacetedSearchLiveStatus;
	contacts: IFacetedSearchContacts;
	groupExposed: IFacetedSearchGroupExposed;
	doseRbm: IFacetedSearchDose;
	doseSt: IFacetedSearchDose;
	personal: IFacetedSearchPersonal;
	location: IFacetedSearchLocation;
	diagnoz: IFacetedSearchDiagnoz;
}

export interface IState {
	query: string;
	status: string;
	form: IFacetedSearchForm;
	res?: facetedSearchResult; // результат поиска
}

export type facetedSearchResult = {
	count: number;
	sn_list: number[];
	query: string;
}

export const state: IState = {
	query: "",
	status: "",
	form: {
		searchParams: {
			enable: true,
			limit: "10000",
		},
		liveStatus: {
			enable: false,
			status: true,
			checkbox: ["status-1", "status-3", "status-4"],
			date: {
				enable: true,
				from: "2000",
				to: new Date().getFullYear().toString(),
			},
		},
		contacts: {
			enable: false,
			checkbox: ["address", "phone"],
		},
		groupExposed: {
			enable: false,
			checkbox: ["1"],
		},
		location: {
			enable: false,
			checkbox: ["1"],
		},
		diagnoz: {
			enable: false,
			checkbox: [],
			present: {
				enable: false,
				ekr: "", // МКБ-10
				fib: "", // МКБ-9
			},
			where: false,
			absent: {
				enable: false,
				ekr: "", // МКБ-10
				fib: "", // МКБ-9
			},
		},
		personal: {
			enable: false,
			checkbox: ["sex", "sex-female", "age", "ethnic-0", "ethnic-1"],
			sex: true,
			age: {
				enable: true,
				from: "1950",
				to: "2001",
			},
			ethnic: false,
		},
		doseRbm: {
			enable: false,
			acc: {
				enable: true,
				from: "",
				to: "",
			},
			rate: {
				enable: true,
				from: "",
				to: "",
			},
			checkbox: ["acc-rbm", "rate-rbm"],
		},
		doseSt: {
			enable: false,
			acc: {
				enable: true,
				from: "",
				to: "",
			},
			rate: {
				enable: true,
				from: "",
				to: "",
			},
			checkbox: ["acc-st", "rate-st"],
		},
	},
}


const mutations = {
	[FACETED_SEARCH.ERROR]: (state: IState, statusText: string) => {
		state.status = statusText
	},
	[FACETED_SEARCH.REQUEST]: (state: IState) => {
		state.status = STATUS.DATA_LOADING
	},

	[FACETED_SEARCH.SUCCESS]: (state: IState, res: facetedSearchResult) => {
		state.status = STATUS.SUCCESS
		state.res = cloneDeep(res)
	}
}

const actions = {
	[FACETED_SEARCH.REQUEST]: async ({ commit }, searchQuery: IFacetedSearchForm) => {
		commit(FACETED_SEARCH.REQUEST)

		return new Promise((resolve, reject) => {
			api.post<facetedSearchResult>({ url: "/facetedSearch", data: searchQuery })
				.then(res => {
					commit(FACETED_SEARCH.SUCCESS, res)
					resolve(res)
				})
				.catch(() => {
					const errMessage = api.statusText()
					commit(FACETED_SEARCH.ERROR, errMessage)
					reject(errMessage)
				})
		})

	},



}



export default {
	namespaced: true,
	state,
	getters: {
		getForm: (state: IState) => {
			return cloneDeep(state.form)
		},
		getResult: (state: IState) => {
			return cloneDeep(state.res)
		}
	},
	actions,
	mutations

}