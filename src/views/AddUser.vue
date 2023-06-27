<template lang="pug">
div.view
  h1 Редактирование учетных записей
  div.split-pane
    div.split-pane--left
      h2 Создание новой учетной записи
      i-form(ref="form-add-user",:model="formAddUser",:rules="ruleAddUser")

          div.panel-edit-user
              FormItem(prop="login")
                i-input(v-model="formAddUser.login",placeholder="Учетная запись")
                  Icon(type="md-person",slot="prepend")

              FormItem(prop="name")
                i-input(v-model="formAddUser.name",placeholder="Имя Фамилия")
                  Icon(type="md-contact",slot="prepend")

              FormItem(prop="password")
                i-input(v-model="formAddUser.password",type="password",placeholder="Пароль",password)
                  Icon(type="md-lock",slot="prepend")

              FormItem(prop="group")
                i-select(v-model="formAddUser.groupID",filterable,allow-create,@on-create="handleCreateGroup",placeholder="Группа безопасности",prefix="md-people")
                  i-option(v-for="user in secGroups",:value="user.id" :key="user.id") {{ user.name }}

              FormItem
                  i-button(type="primary",@click="handleSubmit('form-add-user')") Добавить
    div.split-pane--right
      h2 Список учетных записей
      div.spin-container(v-if="!(secUsers && secUsers.length>0)")
        Spin(fix,style="background-color: transparent;")
      div.panel-list-secUsers
        List(border)
          ListItem(v-for="u in secUsers",:key="u.id")
            ListItemMeta(:title="u.name",:description="u.login")
            template(slot="action")
              li
                Tooltip(content="Переименовать")
                  Icon(type="md-create",@click="askRenameUser(u)",size="24")
              li(v-if="u.id>1")
                Tooltip(content="Удалить")
                  Icon(type="md-remove-circle",@click="askRemoveUser(u)",size="24")

  Modal(ref="modal", v-model="modal.show",title="Переименовать",ok-text="Выполнить", cancel-text="Отменить",
        @on-ok="modalOk",:loading="modal.loading")
    i-form(ref="form-rename-user",:model="modal.user",:rules="ruleAddUser",@submit.native.prevent,
    :disabled="modal.disabled")
      div Имя и фамилия:
        FormItem(prop="name")
          i-input(style="margin-top:0.5rem",v-model="modal.user.name",@on-enter="modalEnter"
                    placeholder="Имя Фамилия",ref="modalnputRef")
            Icon(type="md-contact",slot="prepend")
</template>

<script lang="ts">
import Vue from "vue";
import { mapGetters } from "vuex";

import locale from "view-design/src/components/locale";
import lang from "view-design/dist/locale/ru-RU";

import { VForm, VModal } from "@/utils/types";
import { SEC, sysUsersItem } from "@/store/modules/security/groups";

import {
  Input,
  Button,
  Icon,
  Select,
  Option,
  Form,
  FormItem,
  Tooltip,
  Modal,
  Spin
} from "view-design";

import List from "view-design/src/components/list";

locale(lang);

Vue.component("i-form", Form);
Vue.component("FormItem", FormItem);
Vue.component("i-option", Option);
Vue.component("i-select", Select);
Vue.component("List", List);
Vue.component("ListItem", List.Item);
Vue.component("ListItemMeta", List.Item.Meta);
Vue.component("i-button", Button);
Vue.component("i-input", Input);
Vue.component("Icon", Icon);
Vue.component("Tooltip", Tooltip);
Vue.component("Modal", Modal);
Vue.component("Spin", Spin);

Vue.prototype.$Modal = Vue.prototype.$Modal ? Vue.prototype.$Modal : Modal;

export default Vue.extend({
  data() {
    return {
      loadingUserList: false,
      value: "", // FIX: ненужно ?
      modal: {
        value: "", // FIX: ненужно ?
        user: {} as sysUsersItem,
        show: false,
        loading: true,
        disabled: false
      },
      formAddUser: {
        login: "",
        name: "",
        password: "",
        groupID: null
      } as sysUsersItem,
      rulesEnable: false,
      ruleAddUser: {
        login: [
          {
            required: true,
            message: "Необходимо указать учетную запись",
            trigger: "blur"
          }
        ],
        name: [
          {
            required: true,
            message: "Необходимо указать фамилию и имя",
            trigger: "blur"
          }
        ],
        password: [
          {
            required: true,
            message: "Необходимо ввести пароль",
            trigger: "blur"
          }
        ]
      }
    };
  },
  computed: {
    ...mapGetters(["secGroups", "secUsers"])
  },
  mounted() {
    this.$store.dispatch(SEC.GROUPS_REQUEST);
    this.$store.dispatch(SEC.USERS_REQUEST);
  },
  methods: {
    modalEnter() {
      (this.$refs["modal"] as VModal).ok();
    },
    modalOk() {
      const renameForm = this.$refs["form-rename-user"] as VForm;

      renameForm.validate(valid => {
        if (valid) {
          this.modal.disabled = true;

          this.$store
            .dispatch(SEC.USER_RENAME_REQUEST, this.modal.user)
            .then(() => {
              this.modal.show = false;
              this.$Message.success("Успешно!");
            })
            .catch(errMessage => {
              this.$Message.error(errMessage);
              this.modal.disabled = false;
              (this.$refs["modal"] as VModal).buttonLoading = false;
            });
        } else {
          this.$Message.error("Ошибка в данных, проверьте поля формы.");
          (this.$refs["modal"] as VModal).buttonLoading = false;
        }
      });
    },
    askRenameUser(u: sysUsersItem) {
      // показываем модальное окно
      this.modal.user = { ...u };
      this.modal.disabled = false;
      this.modal.show = true;

      Vue.nextTick(() => {
        const el = this.$refs["modalnputRef"] as Input;
        el.focus();
      });
    },
    askRemoveUser(u: sysUsersItem) {
      this.$Message.info("Удаляем: " + u.name);

      this.$store.dispatch(SEC.USER_DEL_REQUEST, u).catch(errMessage => {
        this.$Message.error(errMessage);
      });
    },
    handleCreateGroup(val: string) {
      this.secGroups.push({
        id: +this.secGroups[this.secGroups.slice(-1)[0].id + 1],
        name: val
      });
    },
    handleSubmit(name) {
      (this.$refs[name] as VForm).validate(valid => {
        if (valid) {
          this.$store
            .dispatch(SEC.USER_ADD_REQUEST, { ...this.formAddUser })
            .then(() => {
              // .then(id => {
              // console.log("id of new user ->", id);
              this.$Message.success("Новый пользователь успешно добавлен.");
              (this.$refs["form-add-user"] as VForm).resetFields();
            })
            .catch(errMessage => {
              this.$Message.error(errMessage);
            });
        } else {
          this.$Message.error("Ошибка в данных, проверьте поля формы.");
        }
      });
    }
  }
});
</script>

<style lang="scss" scoped>
.panel-edit-user {
  max-width: 400px;
  margin-top: 0.5rem;
}

.panel-list-secUsers {
  max-width: 400px;
  margin-top: 1rem;
}

.split-pane {
  display: flex;
}

.split-pane--left {
  max-width: 480px;
  flex-basis: 400px;
  flex-grow: 1;
}

.split-pane--right {
  min-width: 300px;
  flex-grow: 5;

  .spin-container {
    display: inline-block;
    width: 400px;
    height: 100px;
    position: relative;
    background-color: transparent;
  }
}

.split-pane--left,
.split-pane--right {
  padding: 10px;
  border: 1px solid #dcdee2;
}
</style>