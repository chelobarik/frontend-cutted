<template lang="pug">
.panel-statistic
  h2 {{ title }}
  .description {{ description }}
  p.counter Общее число людей в данной группе:
    span.value {{ stat.total }}

  Row(style="background:#eee;padding:0 1em")
    Col(span="11")
      Card(:bordered="false")
        h3(slot="title")
          Icon(type="md-nuclear", size="18", style="padding-right:0.5em")
          | Статус облучения
        h4 «Облученный»
        ul.card
          li(v-for="i in [1, 0]", :key="i") {{ doseTitles[i] }}:
            span.value {{ stat.doseGroup[i].count }}
            span.procent (&thinsp;{{ prc(stat.doseGroup[i].count) }}&thinsp;)
        h4 «Необлученный»
        ul.card
          li(v-for="i in [2, 3]", :key="i")
            | {{ doseTitles[i] }}:
            span.value {{ stat.doseGroup[i].count }}
            span.procent (&thinsp;{{ prc(stat.doseGroup[i].count) }}&thinsp;)
      Card(:bordered="false")
        h3(slot="title")
          Icon(type="md-medkit", size="18", style="padding-right:0.5em")
          | Наличие диагнозов
        ul.card
          li Установлено в клинике Центра:
            span.value {{ stat.fib }}

          li Установлено в ЦРБ:
            span.value {{ stat.ekr }}

          li Хронический лучевой синдром (ХЛС):
            span.value {{ stat.crs }}

    Col(span="11", offset="1")
      Card(:bordered="false")
        h3(slot="title")
          Icon(type="md-filing", size="18", style="padding-right:0.5em")
          | Архив отсканированных документов
        ul.card
          li Истории болезни:
            span.value {{ stat.historycard }}
          li Амбулаторные карты:
            span.value {{ stat.ambulcard }}
          li Формализованные амбулаторные карты:
            span.value {{ stat.formalcard }}

      Card(:bordered="false")
        h3(slot="title")
          Icon(type="md-person", size="18", style="padding-right:0.5em")
          | Жизненный статус
        ul.card
          li Умершие:
            span.value {{ stat.dead }}
            span.procent (&thinsp;{{ prc(stat.dead) }}&thinsp;)

          li Живые:
            span.value {{ stat.alive }}
            span.procent (&thinsp;{{ prc(stat.alive) }}&thinsp;)

  .bottom-hint
    h3 Статус «облученный»
    p Облучение произошло:
      ul.abc
        li а) при проживании с 1.01.1950 по 31.12.1960 в любом населенном пункте, расположенном на реке Теча;
        li б) при проживании с 29.09.1957 по 31.12.1960 в любом населенном пункте, отнесенном к ВУРСу;
        li в) в результате участия в ликвидации последствий аварий на Южном Урале (имеется удостоверение облученного гражданина).

      h4 «Доза восстановлена»:
      span оценка дозы произведена по модели TRDS 2016.

      br
      h4 «Доза не восстановлена»:
      span информации для восстановления дозы облучения недостаточно.

    h3 Статус «необлученный»
    p Установлено что сам гражданин не подвергался облучению в аварийных ситуациях на Южном Урале.
      h4 «Потомки облученных родителей»:
      span хотя бы один из его родителей/прародителей был подвергнут облучению.

      br
      h4 «Не облучались»:
      span эти граждане могут рассматриваться как «контрольные».

</template>

<script lang="ts">
import Vue from "vue";
import { PropType } from "vue";
import { StatData } from "@/utils/measureStat";
import { Icon, Card, Row, Col } from "view-design";

Vue.component("Icon", Icon);
Vue.component("Card", Card);
Vue.component("Row", Row);
Vue.component("Col", Col);

const doseTitles = [
  "Доза не восстановлена",
  "Доза восстановлена",
  "Потомки облученных родителей",
  "Не облучались",
];

export default Vue.extend({
  props: {
    stat: {
      type: Object as PropType<StatData>,
      default: new StatData(),
    },
    title: {
      type: String,
      default: "—",
    },
    description: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      doseTitles: doseTitles,
    };
  },
  methods: {
    prc(value: number): string {
      return this.stat.total
        ? Math.round((value / this.stat.total) * 100) + "%"
        : "—";
    },
  },
});
</script>

<style lang="scss" scoped>
.ivu-card {
  margin: 1em 0;
}

.panel-statistic {
  h2,
  h3 {
    display: block;
  }
  h3 {
    margin: 0;
    padding: 0;
  }

  ul {
    font-family: $font;
    padding-left: 0.5em;
    margin-bottom: 0.5em;
  }

  li {
    list-style-type: none;
  }

  .bottom-hint {
    font-family: $font;
    p {
      margin: 0 0 0.5em;
    }
    h4 {
      display: inline;
    }
    span {
      margin-left: 0.5em;
    }
  }

  ul.card {
    li {
      padding: 2px 0;
    }
  }

  .value {
    font-weight: 600;
    padding-left: 0.5em;
  }

  .procent {
    margin-left: 0.5em;
    color: gray;
  }

  .sub-title {
    font-weight: 600;
  }

  .counter {
    margin-bottom: 1em;
  }

  .description {
    margin-bottom: 0em;
  }
}
</style>
