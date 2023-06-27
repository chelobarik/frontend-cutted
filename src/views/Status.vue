<template lang="pug">
.view
  h1 Статус человека и его измерения

  .search
    Input(
      v-model="value",
      search,
      placeholder="Системный номер",
      @on-change="onChange"
    )
      span(slot="prepend") SN:
    .ivu-form-item-error-tip(style="position:inherit", v-show="!valid")
      | Необходимо ввести целое число
    .found(v-show="valid && value!='' && !dataLoaded") Не найдено

  .statistic(v-show="dataLoaded")
    Card(style="margin-top:1rem;")
      p(slot="title")
        Icon.title-icon(type="md-person")
        span(style="padding-left:1rem; font-weight:600") Статус
      ul
        li Жизненный статус:&nbsp;
          span.value {{ getSnStatus.lifeStatus.title | capitalize }} &nbsp;
          span(v-if="getSnStatus.lifeStatus.year>0") (сведения на {{ getSnStatus.lifeStatus.year }})

        li Статус облучения:&nbsp;
          span.value {{ getSnStatus.exposeGroup | capitalize }}

        li Наличие диагнозов:&nbsp;
          span.value(v-if="getSnStatus.diagnoses.length > 0") {{ getSnStatus.diagnoses.join(', ') }}
          span.value(v-else) нет

    Card(style="margin-top:1rem;", v-show="getSnStatus.measures")
      p(slot="title")
        Icon.title-icon(type="md-analytics")
        span(style="padding-left:1rem; font-weight:600") Группы измерений
      ul(v-if="getSnStatus.measures.length > 0")
        li(v-for="rg in getSnStatus.measures", :key="rg.rgID")
          span.sub-title {{ rg.name }}
          ul
            li(v-for="m in rg.child", :key="m.mID")
              Icon.colored(type="md-flask")
              span.measure-title {{ m.title }}
      ul(v-else)
        li Не измерялся
</template>



<script lang="ts">
import Vue from "vue";
import { mapGetters } from "vuex";

import { Input, Icon, Card } from "view-design";
import { REGISTR } from "@/store/modules/registr";
import { Options } from "@/store";

Vue.component("Input", Input);
Vue.component("Icon", Icon);
Vue.component("Card", Card);

export default Vue.extend({
  props: {
    sn: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      value: "",
      dataLoaded: false,
      valid: true,
    };
  },
  computed: {
    ...mapGetters(["getSnStatus", "registr", "registrLoaded", "getOptions"]),
  },
  mounted() {
    // IDEA: это загружает список всех sn и не посылает запросы, если введен несуществующий sn
    if (!this.sn) return;
    this.value = this.sn.toString();

    this.updateResults();
  },
  methods: {
    onChange() {
      const v = this.value.trim(),
        sn = parseInt(v, 10);

      this.valid = v == "" || (sn.toString() == v);

      if (this.registr) {
        if (this.registr.has(sn)) this.updateResults();
        else this.dataLoaded = false;
      } else {
        this.updateResults();
      }
    },
    updateResults() {
      // загружаем данные если введено корректное число и оно >= 19
      const snRange = (this.getOptions as Options).sn,
        sn = parseInt(this.value, 10),
        // ( sn<0 || (sn>0 && sn > snRange.min && sn <= snRange.max)) &&
        needLoad = this.valid && sn <= snRange.max &&
          // если загружен список sn, то проверить, есть ли наше значение там
          (!this.registrLoaded || this.registr.has(sn));

      if (!needLoad) {
        this.dataLoaded = false;
        return;
      }

      this.$store
        .dispatch(REGISTR.SN_STATUS_REQUEST, Number(this.value))
        .then(() => {
          this.dataLoaded = true;
        })
        .catch(() => {
          this.dataLoaded = false;
        });
    },
  },
});
</script>

<style lang="scss" scoped>
.search {
  width: 300px;
  margin-top: 0.5rem;
  .found {
    color: rgba(0, 50, 120, 0.3);
  }
}
.statistic {
  font-family: $font;
  width: 350px;

  ul {
    padding: 0 0 0 0.5;
    margin-top: 0;
  }

  li {
    list-style-type: none;
    margin: 0;
    padding: 4px;
  }

  h3 {
    margin-bottom: 0.25em;
  }

  .sub-title {
    font-weight: 600;
  }
  .measure-title {
    margin-left: 0.25rem;
  }

  .value {
    font-weight: 600;
  }

  .colored {
    color: $flaskColor;
  }

  .title-icon {
    color: $flaskColor;
  }

  .found-info {
    color: #dcdee2;
  }
}
</style>
