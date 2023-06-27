<template lang="pug">
.layout
  Layout
    Header(style="overflow: hidden;")
      Menu(
        mode="horizontal",
        theme="dark",
        active-name="1",
        @on-select="clickMenu"
      )
        .layout-mainmenu
          .layout-nav
            MenuItem(name="1", to="/")
              Icon(type="md-search", size="24")
              | Регистр
            MenuItem(name="5", to="/faceted")
              Icon(type="md-list-box", size="24")
              | Конструктор выборок
            MenuItem(name="2", to="/measures")
              Icon(type="md-analytics", size="24")
              | Измерения
            MenuItem(name="3", :to="{ name: 'status', params: { sn: null } }")
              Icon(type="md-person", size="24")
              | Статус
            MenuItem(name="Suggestions")
              Icon(type="md-chatbubbles", size="24")
              | Предложения и замечания
          .layout-userprofile
            MenuItem(name="4", to="/adduser", v-if="isAdmin")
              Icon(type="md-person-add", size="24")
              | Добавить пользователя
            | {{ userName }}
            MenuItem(name="AuthMenuItem")
              Icon(
                :type="isAuthenticated ? 'md-log-out' : 'md-log-in'",
                size="24"
              )
              | {{ isAuthenticated ? 'Выход' : 'Вход' }}
    Content
      router-view
    Footer
      .version
        abbr(title="Дата импорта данных из БД \"Человек\"") {{ dbVersion }}
</template>


<script lang="ts">
import Vue from "vue";
import { mapGetters } from "vuex";
import { DBMetrics } from "./static/exposeType"

import {
  Layout,
  Header,
  Menu,
  MenuItem,
  Icon,
  Content,
  Message,
} from "view-design";
import AUTH from "@/store/actions/auth";
import api from "@/utils/api";
import { USER_REQUEST } from "@/store/actions/user";

Vue.component("Layout", Layout);
Vue.component("Header", Header);
Vue.component("Menu", Menu);
Vue.component("MenuItem", MenuItem);
Vue.component("Icon", Icon);
Vue.component("Content", Content);

Vue.prototype.$Message = Message;

Vue.filter('capitalize', function (value: string) {
  if (!value) return ''
  value = value.toString()
  return value.charAt(0).toUpperCase() + value.slice(1)
})


export default Vue.extend({
  data() {
    return {
      dbVersion: "",
    };
  },
  computed: {
    userName(): string {
      return this.isProfileLoaded ? this.getProfile.name : "";
    },
    ...mapGetters([
      "isAuthenticated",
      "getProfile",
      "isProfileLoaded",
      "isAdmin",
    ]),
  },
  mounted() {
    if (api.token) {
      this.$store.dispatch(USER_REQUEST);
    }
    api
      .get<DBMetrics>({ url: "/dbmetrics" })
      .then((res) => {
        const d = new Date(res.dbdate);
        this.dbVersion = d.toLocaleDateString("ru-RU");
      })
      .catch(() => {
        this.dbVersion = "Ошибка подключения к БД";
      });
  },
  methods: {
    clickMenu(name: string) {
      switch (name) {
        case "AuthMenuItem":
          this.clickAuth();
          break;
        case "Suggestions":
          this.clickSuggestions();
          break;
      }
    },

    clickAuth() {
      const path = "/signin";

      if (this.isAuthenticated) {
        // выход
        this.$store.dispatch(AUTH.LOGOUT);
        this.$Message.info("Выход");
        this.$router.push(path);
      } else {
        if (this.$route.path !== path) this.$router.push(path);
      }
    },

    clickSuggestions() {
      this.$Modal.confirm({
        title: "Переход на сайт Google Groups",
        content:
          "Сейчас вы будете переведены на сайт Google Groups, " +
          "где сможете описать своё предложение. Вам потребуется авторизация Google.",
        okText: "OK",
        cancelText: "Отменить",
        onOk: () => {
          window.open("https://groups.google.com/g/rapp123", "_blank");
        },
      });
    },
  },
});
</script>


<style lang="scss">

html,
body {
  height: 100%;
}

.layout {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.layout-mainmenu {
  display: flex;
  justify-content: space-between;
}

.layout-userprofile {
  color: wheat;
  display: flex;
}

.suggestions {
  margin-left: 10em;
}

.version {
  text-align: right;
  padding: 0.5em;
  background: #cbced4;
  color: rgba(255, 255, 255, 0.7);

  abbr[title] {
    text-decoration: none !important;
    border-bottom: none !important;
    user-select: none !important;
  }
}
</style>

