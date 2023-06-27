<template lang="pug">
div.view
  div.panel-login
    i-form(ref="formSignIn",:model="formSignIn",:rules="ruleSignIn")
      FormItem(prop="user")
        i-input(type="text",v-model="formSignIn.user",placeholder="Учетная запись",@on-enter="enterClicked",autofocus)
          Icon(type="md-person",slot="prepend")
      FormItem(prop="password")
        i-input(type="password",password,v-model="formSignIn.password",placeholder="Пароль",@on-enter="enterClicked")
          Icon(type="md-lock",slot="prepend")
      FormItem
        Button(type="primary",@click="handleSubmit",:loading="loading") Вход
</template>

<script lang="ts">
/* eslint no-console: off */
import Vue from "vue";
import { mapGetters } from "vuex";
import AUTH from "@/store/actions/auth";
import { IUser } from "@/store/modules/auth";

import { Input, Form, FormItem, Button } from "view-design";

import { VForm } from "@/utils/types";

Vue.component("i-input", Input);
Vue.component("i-form", Form);
Vue.component("FormItem", FormItem);
Vue.component("Button", Button);

export default Vue.extend({
  data() {
    return {
      loading: false,
      formSignIn: {
        user: "",
        password: ""
      } as IUser,
      ruleSignIn: {
        user: [
          {
            required: true,
            message: "Необходимо указать свою учетную запись",
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
    ...mapGetters(["isAuthenticated", "authStatus"])
  },
  methods: {
    enterClicked() {
      const { user, password } = this.formSignIn;
      if (user && password) this.handleSubmit();
    },
    async handleSubmit() {
      (this.$refs["formSignIn"] as VForm).validate(async valid => {
        if (!valid) {
          // this.$Message.error("Fail!");
          return;
        }

        this.loading = true;

        try {
          await this.$store.dispatch(AUTH.REQUEST, this.formSignIn);
          this.$Message.success("Успешный вход.");
          this.$router.replace("/");
        } catch (errText) {
          this.$Message.error("Неверное имя пользователя или пароль.");
        }

        this.loading = false;
      });
    }
  }
});
</script>
<style lang="scss" scoped>
.panel-login {
  max-width: 300px;
}
</style>

