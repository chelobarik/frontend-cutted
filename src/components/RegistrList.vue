<template lang="pug">
.list
  Table(
    :columns="columns",
    :data="list",
    height="500",
    @on-row-click="onRowClick",
    @on-row-dblclick="onRowDblClick"
  )
    template(slot-scope="{ row }", slot="status")
      .status-cell

        .icon(:class="{ 'is-die': row.lifestatus == IS_DIE }")
          abbr(
            :title="row.lifestatus ? (row.lifestatus == IS_DIE ? `Умер${row.sex ? 'ла' : ''}` : `Жив${row.sex ? 'а' : ''}`) : 'Жизненый статус неизвестен'"
          )
            Icon(:type="row.lifestatus ? 'md-person' : 'md-help'")

          abbr(:title="row.sex!==null ? exposeSex[+row.sex] : 'Пол не указан'")
            Icon(:type="row.sex ? 'md-female' : (row.sex!==null ? 'md-male' : 'md-help') ")

          abbr(:title="exposeText[+row.sex][row.exposgroup]")
            Icon(:type="exposeIcon[row.exposgroup]")

        .title
          span {{ row.sur + ' ' + row.nam }}
          span.second(v-if="row.sur2 || row.sur3") {{ row.sur3 ? row.sur1 + ', ' + row.sur2 : row.sur1 }}

    template(slot-scope="{ row }", slot="byear")
      Tooltip(:content="age(row.byear)", v-if="row.lifestatus != IS_DIE") {{ row.byear }}
      Tooltip(
        :content="`Умер${row.sex ? 'ла' : ''} (сведения ${row.yearoflifestatus} года)`",
        v-if="row.lifestatus == IS_DIE"
      ) {{ row.byear }}
</template>

<script lang="ts">
import Vue from "vue";

import { registrType } from "@/store/modules/registr";

import { Icon, Table, Tooltip } from "view-design";
import { exposeTypeList } from "@/static/exposeType";

import Clipboard from "v-clipboard";
import { ageStr } from "../utils/exact";

Vue.component("Table", Table);
Vue.component("Icon", Icon);
Vue.component("Tooltip", Tooltip);

Vue.use(Clipboard);

const curYear = new Date().getFullYear();

declare module "vue/types/vue" {
  // eslint-disable-next-line @typescript-eslint/interface-name-prefix
  interface Vue {
    IS_DIE: number;
    exposeIcon: string[];
    exposeText: string[][];
    exposeSex: string[];
    curYear: number;
    age: (y: number) => string;
    lifestatusTooltipStr: (row: registrType) => string;
  }
}

export default Vue.extend({
  props: {
    list: {
      type: Array as () => registrType[] | undefined,
      default: undefined,
    },
  },
  data() {
    return {
      dblclick: false,
      columns: [
        {
          title: "Фамилия, имя",
          slot: "status",
          width: 310,
        },
        {
          title: "Год рожд.",
          slot: "byear",
          width: 120,
        },
        {
          title: "Имя отца",
          key: "fnam",
        },
        {
          title: "SN",
          key: "sn",
        },
        {
          title: "Дата рожд.",
          key: "bdate",
        },
      ],
    };
  },

  created() {
    this.IS_DIE = 3;
    this.exposeIcon = ["md-help", "md-nuclear", "md-people", "md-checkmark"];
    this.exposeText = new Array(2);
    this.exposeText[0] = exposeTypeList; // для мужчин
    this.exposeText[1] = exposeTypeList; // женщин
    this.exposeText[1][3] = "Не облучалась";
    this.exposeSex = ["Мужчина", "Женщина"];

    this.curYear = new Date().getFullYear();
    this.age = (y: number) => ageStr(curYear - y);
  },
  methods: {
    onRowClick(row: registrType) {
      if (this.dblclick) return;
      setTimeout(() => {
        if (this.dblclick) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this as any).$clipboard(row.sn);
        this.$Message.success(`Системный номер ${row.sn} скопирован`);
      }, 200);
    },
    onRowDblClick(row: registrType) {
      this.$router.push({ name: "status", params: { sn: row.sn.toString() } });
      this.dblclick = true;
      setTimeout(() => {
        this.dblclick = false;
      }, 500);
    },
  },
});
</script>

<style lang="scss" scoped>
.item-body {
  padding-left: 1rem;
}

.is-die {
  color: rgba($color: #0000, $alpha: 0.1);
}

.ivu-list-item {
  display: flex;
  justify-content: space-between;
}
.ivu-list-item:hover {
  background-color: salmon;
}

.left-block {
  width: 18em;
  display: flex;
  justify-content: space-between;
}
.status-cell {
  display: flex;
}

.icon {
  display: flex;
  align-items: center;
  padding-right: 8px;
  width: 56px;
  abbr {
    border-bottom: none;
  }
}

.title {
  display: flex;
  flex-direction: column;
}

.second {
  color: rgba($color: #0000, $alpha: 0.33);
}
</style>

