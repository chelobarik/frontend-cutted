<template lang="pug">
Modal(
  ref="modal",
  v-model="param.show",
  :title="param.title",
  ok-text="Выполнить",
  cancel-text="Отменить",
  @on-ok="clickOk",
  :loading="loading"
)
  Form(
    ref="form",
    :model="param.measure",
    :rules="ruleAddMeasure",
    @submit.native.prevent
  )
    div {{ param.label }}
      FormItem(prop="name")
        Input(
          ref="input",
          style="margin-top: 0.5rem",
          v-model="param.measure.name",
          @on-enter="pressEnter",
          placeholder="Название"
        )
          Icon.measure-flask(type="md-flask", slot="prepend", size="20")
      FormItem(prop="description")
        Input(
          ref="input-descr",
          v-model="param.measure.description",
          type="textarea",
          :autosize="{ minRows: 2, maxRows: 5 }",
          placeholder="Описание"
        )
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
// import { mapGetters } from "vuex";

import { VForm, VModal } from "@/utils/types";

import { MEASURES, measureItem } from "@/store/modules/measures";

import locale from "view-design/src/components/locale";
import lang from "view-design/dist/locale/ru-RU";

import { Button, Tooltip, Modal, Form, FormItem, Input } from "view-design";

Vue.component("Button", Button);
Vue.component("Tooltip", Tooltip);
Vue.component("Modal", Modal);
Vue.component("Form", Form);
Vue.component("FormItem", FormItem);
Vue.component("Input", Input);

locale(lang);

Vue.prototype.$Modal = Vue.prototype.$Modal ? Vue.prototype.$Modal : Modal;

export type VModalMeasure = Vue & {
  /**
   * Устанавливает фокус на Input
   */
  focus(): void;
  /**
   * Очищает форму
   */
  resetFields(): void;
};

export enum EditMode {
  ADD,
  MODIFY
}

export type ModalParam = {
  show: boolean;
  orig: measureItem; // measure до изменений
  measure: measureItem;
  researchID: number;
  title: string;
  label: string;
  editMode: EditMode;
};

export default Vue.extend({
  props: {
    param: {
      type: Object as PropType<ModalParam>,
      default: {
        show: false,
        editMode: EditMode.ADD,
        orig: { rgid: 0, id: 0, name: "", description: "" },
        measure: { rgid: 0, id: 0, name: "", description: "" },
        researchID: 0
      }
    }
  },
  data() {
    return {
      loading: true,
      ruleAddMeasure: {
        name:
        {
          required: true,
          message: "Необходимо указать название измерения",
          trigger: "blur",
          transform(value: string) {
            return value.trim();
          },
        },
      }
    };
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
      const p = this.param,
        isAdd = p.editMode === EditMode.ADD;

      if (isAdd) {
        p.measure.rgid = p.researchID;
      }

      const form = this.$refs.form as VForm,
        modal = this.$refs.modal as VModal;

      form.validate(async (valid) => {

        if (valid) {

          try {
            const measureID = isAdd ? await this.$store.dispatch(MEASURES.ADD_REQUEST, {... p.measure} )
              : await this.$store.dispatch(MEASURES.RENAME_REQUEST, { oldMeasure: p.orig, newMeasure: p.measure });
            p.show = false;
            this.$Message.success("Успешно!");
            if (measureID && isAdd) {
              p.measure.id = measureID;
              this.$emit("measure-added", this.$store.getters.getMeasure(p.measure.id) );
            }
          } catch (e) {
            if (e instanceof Error) this.$Message.error(e.message);
            else this.$Message.error(e as string);
            modal.buttonLoading = false;
            this.focus();
          }
        } else {
          this.$Message.error("Ошибка в данных, проверьте поля формы.");
          modal.buttonLoading = false;
        }
      });
    },
  },
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
  .split-pane--left-wraper {
    display: flex;
    justify-content: space-between;
  }

  max-width: 480px;
  // flex-basis: 50%;
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