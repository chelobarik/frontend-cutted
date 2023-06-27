<template lang="pug">
div.view
  h1 Поиск человека в регистре
  div.search
    Input(v-model="searchText", search, placeholder="Фамилия или системный номер"
          @on-change="onChange", @on-enter="onChange")
      Icon(slot="prepend", type="md-person")
    div.ivu-form-item-error-tip(style="position:inherit", v-show="!valid || notFound")
      | {{getErrorText}}
    div.search-bar(v-show="valid")
      span(v-show="search.fam") &nbsp;
        b Фамилия:
        span {{search.fam}}
      span(v-show="search.name") &nbsp;
        b Имя:
        span {{search.name}}
      span(v-show="search.otch") &nbsp;
        b Отчество:
        span {{search.otch}}
      span(v-show="search.sn") &nbsp;
        b SN:
        span {{search.sn}}
      span(v-show="search.year") &nbsp;
        b Год рожд.:
        span {{search.year}}

  RegistrList(v-show="res", :list="res")
</template>

<script lang="ts">

import Vue from "vue";
import { mapGetters } from "vuex";

import locale from "view-design/src/components/locale";
import lang from "view-design/dist/locale/ru-RU";

import { Input, Icon, Modal } from "view-design";

import { REGISTR, searchType, registrType } from "@/store/modules/registr";

import { parseStr, isEqualSearch } from "@/utils/parse";
import RegistrList from "@/components/RegistrList.vue";

locale(lang);

Vue.component("Input", Input);
Vue.component("Icon", Icon);
Vue.component("Modal", Modal);
Vue.component("RegistrList", RegistrList);

Vue.prototype.$Modal =
  typeof Vue.prototype.$Modal == "undefined" ? Modal : Vue.prototype.$Modal;

declare module "vue/types/vue" {
  // eslint-disable-next-line @typescript-eslint/interface-name-prefix
  interface Vue {
    searchTimerId: number | undefined;
  }
}

export default Vue.extend({
  props: {
    sn: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      searchText: "", // строка поиска из Input
      valid: true, // строка поиска валидна и была преобразована в объект поиска
      notFound: false, // был осуществлен поиск, но ничего не найдено
      search: {} as searchType, // объект поиска
      res: undefined as registrType | undefined // результат поиска
    };
  },

  computed: {
    getErrorText(): string {
      return this.notFound
        ? "Ничего не найдено."
        : "Данные введены некорректно!";
    },
    ...mapGetters(["famList", "regSrch", "regSrchText"])
  },

  mounted() {
    // если было передан sn через props, то запускаем поиск по нему
    if (this.sn) {
      this.searchText = this.sn.toString();
    } else {
      // было переключение страниц приложения и ранее был осуществлен поиск, восстановим его результаты
      this.searchText = this.regSrchText ? this.regSrchText : "";
    }

    if (this.searchText != "") {
      const srch = parseStr(this.searchText);

      this.valid = srch !== undefined;

      if (srch !== undefined) {
        this.search = srch;
        // поиск закэширован, запроса к бэкэенду не будет
        this.searchRequest();
      }
    }
  },

  methods: {
    async searchRequest() {
      try {
        this.res = await this.$store.dispatch(
          REGISTR.SEARCH_REQUEST,
          this.search
        );
        // сохраняем строку поиска, если поиск был успешен
        this.$store.commit(REGISTR.SET_SEARCH_TEXT, this.searchText);
        this.notFound = false;
      } catch {
        // ошибка при поиске, ничего не найдено
        this.res = undefined;
        this.notFound = true;
      }
    },

    onChange() {
      // строка ввода изменена, если она не эквивалентна предыдущему поиску,
      // то запускаем новый поиск.
      // если происходит непрерывный ввод данных с клавиатуры,
      // то ожидаем пока пользователь перестанет вводить символы,
      // после чего запускаем поиск

      clearTimeout(this.searchTimerId);
      this.valid = true;

      // если введена пустая строка, то ничего не ищем, очищаем результаты поиска
      if (this.searchText.trim() === "") {
        this.searchTimerId = setTimeout(() => {
          this.search = {};
          this.res = undefined;
          this.notFound = false;
        }, 300);
        return;
      }

      const srch = parseStr(this.searchText);

      // если введенная строка некорректна, то поиск не производим и отображаем строку с ошибкой
      if (srch === undefined) {
        this.res = undefined;
        this.valid = false;
        return;
      }

      // если поиски эквивалентны, и ранее ничего не найдено, то не ищем
      if (this.notFound && isEqualSearch(srch, this.search)) return;

      // обновляем объект для поиска и ставим таймер на запуск самого поиска
      this.search = srch;

      this.searchTimerId = setTimeout(() => {
        this.searchRequest();
      }, 300);
    }
  }
});
</script>

<style lang="scss" scoped>
.search {
  width: 500px;
  margin-top: 0.5rem;
}

.search-bar {
  b {
    font-weight: 400;
    color: rgba(#0000, 0.33);
    margin-right: 0.25em;
  }
  span {
    span {
      padding-right: 0.25em;
    }
  }
}
</style>
