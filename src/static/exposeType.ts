import api from "@/utils/api"

export type exposeTypeItem = {
  id: number;
  name: string;
  description: string;
}


const exposeGroupList = [
  "Доза не восстановлена",
  "Доза рассчитана",
  "Потомок облученных родителей",
  "Не облучался"
]

export let exposeTypeList = exposeGroupList;
export let exposeTypes = exposeGroupList.map((e, i) => ({ id: i, name: e, description: '' } as exposeTypeItem));

export async function ExportTypesInit() {
  try {
    exposeTypes = await api.get<exposeTypeItem[]>({ url: "/exposetypes" })
    exposeTypeList = exposeTypes.map(e => e.name)
  } catch {
    const errMessage = api.statusText()
    console.log(errMessage)
  }
}


type MinMax = {
  min?: number;
  max?: number;
}

export type DBMetrics = {
    dbdate: Date;
    dose:   {  // максимальные и минимальные дозы
      acc: MinMax; // мощность дозы
      rate: MinMax; // накопленная доза
    };
  }
