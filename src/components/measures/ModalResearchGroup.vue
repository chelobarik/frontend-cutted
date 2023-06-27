<template lang="pug">
  Modal(ref="modal" :title="getTitle" ok-text="Выполнить" cancel-text="Отменить"
      :value="value.show"
      @input="v=>{param.show=v;$emit('input',param)}"
      @on-ok="clickOk"
      )
    Form(ref="form" :model="param.d" :rules="ruleAddGroup" @submit.native.prevent)
      div Название:
        FormItem(prop="name")
          Input(ref="input" style="margin-top:0.5rem" placeholder="Название"
            :value="value.d.name"
            @input="v=>{param.d.name=v}"
            @on-enter="pressEnter"
          )
            Icon(type="md-flask" slot="prepend" size="20" class="measure-flask")
      div Администратор:
        FormItem(prop="owner")
          Select(filterable placeholder="Администратор группы" prefix="md-person"
            :value="value.d.owner"
            @input="v=>{param.d.owner=v}"
          )
           Option(v-for="user in secUsers" :value="user.id" :key="user.id" :label="user.name")
            span {{ user.name }}
            span(style="float:right;color:#ccc") {{ user.login }}
      div Доступ на запись:
        FormItem(prop="rwgroup")
          Select(filterable placeholder="Группа чтения и записи" prefix="md-people"
            :value="value.d.rwgroup"
            @input="v=>{param.d.rwgroup=v}"
          )
           Option(v-for="g in secGroups" :value="g.id" :key="g.id" :label="g.name" )
            span {{ g.name }}
            span(style="float:right;color:#ccc") {{ g.description }}

</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { mapGetters } from "vuex";

import locale from "view-design/src/components/locale";
import lang from "view-design/dist/locale/ru-RU";

import { SEC } from "@/store/modules/security/groups";
import { VForm, VModal } from "@/utils/types";

import { researchItem } from "@/store/modules/researches";
import { EditMode } from "./ModalMeasure.vue";

import {
  Button,
  Tooltip,
  Modal,
  Form,
  FormItem,
  Input,
  Option,
  Select
} from "view-design";

locale(lang);

Vue.component("Button", Button);
Vue.component("Tooltip", Tooltip);
Vue.component("Modal", Modal);
Vue.component("Form", Form);
Vue.component("FormItem", FormItem);
Vue.component("Input", Input);
Vue.component("Option", Option);
Vue.component("Select", Select);

Vue.prototype.$Modal = Vue.prototype.$Modal ? Vue.prototype.$Modal : Modal;

export type ModalParam = {
  show: boolean;
  mode: EditMode;
  d: researchItem;
};

export default Vue.extend({
  props: {
    value: {
      type: Object as PropType<ModalParam>,
      required: true,
    }
  },
  data() {
    return {
      param: {
        show: this.value.show,
        mode: this.value.mode,
        d: { ...this.value.d }
      } as ModalParam,
      ruleAddGroup: {
        name: [
          {
            required: true,
            message: "Необходимо указать название группы",
            trigger: "blur"
          }
        ]
      }
    };
  },
  computed: {
    getTitle(): string {
      return (
        (this.value.mode === EditMode.ADD ? "Добавить" : "Изменить") + " группу"
      );
    },
    ...mapGetters(["secGroups", "secUsers"])
  },
  mounted() {
    this.$store.dispatch(SEC.GROUPS_REQUEST);
    this.$store.dispatch(SEC.USERS_REQUEST);
  },
  methods: {
    focus() {
      (this.$refs.input as Input).focus();
    },
    resetFields() {
      (this.$refs.form as VForm).resetFields();
    },
    pressEnter() {
      (this.$refs.modal as VModal).ok();
    },
    clickOk() {
      this.param.mode = this.value.mode
      this.param.d.id = this.value.d.id
      this.$emit("on-click-ok", this.param);
    }
  }
});
</script>


<style lang="scss" scoped>
.measure-flask {
  color: $flaskColor;
}

.split-pane {
  display: flex;
}

.split-pane--left {
  .split-pane--left-wrapper {
    display: flex;
    justify-content: space-between;
  }

  max-width: 480px;
  flex-basis: 480px;
  flex-grow: 1;
}

.split-pane--right {
  min-width: 300px;
  flex-grow: 5;
  border-left: 2px dotted #dcdee2;
  .split-pane--right-offset {
    margin-left: 1rem;
  }
}

.split-pane--left,
.split-pane--right {
  padding: 10px;
}

.panel-select {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;

  .panel-select--input {
    // flex-basis: 400px;
    min-width: 320px;
    max-width: 420px;
    flex-grow: 1;
  }

  .panel-select--editbutton {
    margin-left: 0.5em;
    flex-grow: 0;
  }

  .ivu-select-group-title {
    color: blue;
  }
}

.progress {
  margin-top: 0.5em;
  color: grey;
}
</style>