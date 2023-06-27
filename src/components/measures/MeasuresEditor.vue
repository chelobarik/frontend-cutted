<template lang="pug">
.measures-editor
  h2 {{ measure.name }}
  .panel-title
    h3 Список измеренных людей:
    ButtonGroup
      Tooltip(
        content="Скопировать список",
        placement="left",
        :disabled="getSNList == ''"
      )
        Button(icon="md-copy", @click="copySNList")
  Input(
    ref="refOrigSNList",
    :value="getSNList",
    readonly="",
    type="textarea",
    :autosize="{ minRows: 2, maxRows: 10 }",
    :placeholder="placeholder"
  )
  .counter
    | Число измерений: {{ getSNcount }}
  div(v-if="editable")
    RadioGroup(v-model="updateMode")
      Radio(label="Заменить", border="")
      Radio(label="Добавить", border="")
    .panel.panel-title
      h3 {{ titleUpdateList }}
      ButtonGroup
        Tooltip(
          content="Очистить список",
          placement="left",
          :disabled="updateList == ''"
        )
          Button(
            icon="md-trash",
            :disabled="updateList == ''",
            @click="updateList = ''"
          )
    Input(
      ref="updateListInput",
      v-model="updateList",
      type="textarea",
      :autosize="{ minRows: 2, maxRows: 10 }",
      placeholder="Системные номера через пробел или запятую..."
    )
    .panel.panel-buttons
      Button(
        type="primary",
        :loading="SNListExecuting",
        :disabled="execButtonDisabled",
        @click="executeUpdate"
      )
        | Выполнить
    .panel.panel-error(v-if="snNotAdded != ''")
      | Список системных номеров, которые не были добавлены:
      | {{ snNotAdded }}
</template>

<script lang="ts">
// IDEA: индикатор загрузки списка измерений

import Vue from "vue";
import { measureItem } from "@/store/modules/measures";

import { mapGetters } from "vuex";
import { toNumberArray } from "@/utils/exact";
import { SNLIST, ISNList } from "@/store/modules/snList";
import difference from "lodash.difference";

import {
  Input,
  RadioGroup,
  Radio,
  Tooltip,
  Button,
  ButtonGroup,
  Switch,
} from "view-design";

Vue.component("Input", Input);
Vue.component("i-switch", Switch);
Vue.component("RadioGroup", RadioGroup);
Vue.component("Radio", Radio);
Vue.component("Tooltip", Tooltip);
Vue.component("Button", Button);
Vue.component("ButtonGroup", ButtonGroup);

const MEASURES_LIST_REPLACE = "Заменить";
const MEASURES_LIST_APPEND = "Добавить";

export default Vue.extend({
  props: {
    measure: {
      type: Object as () => measureItem,
      default: { id: 0 } as measureItem,
    },
    editable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      updateMode: MEASURES_LIST_APPEND,
      updateList: "",
      updateExecuting: false,
      switch1: false,
      snNotAdded: "",
    };
  },
  computed: {
    readonly(): boolean {
      return !this.editable;
    },
    placeholder(): string {
      return this.SNListExecuting ? "Загрузка данных..." : "Нет измерений";
    },
    execButtonDisabled(): boolean {
      return this.updateList == "" && this.updateMode == MEASURES_LIST_APPEND;
    },
    titleUpdateList(): string {
      const titleText = [
          "Добавить измерения людей:",
          "Полностью заменить следующим списком:",
        ],
        i = this.updateMode === MEASURES_LIST_APPEND ? 0 : 1;
      return titleText[i];
    },
    ...mapGetters([
      "getSNList",
      "getSNListAsColumn",
      "getSNcount",
      "SNListExecuting",
    ]),
  },
  methods: {
    async copySNList() {
      try {
        await navigator.clipboard.writeText(this.getSNListAsColumn);
        this.$Message.info("Список системных номеров успешно скопирован."
        );
      } catch (err) {
        this.$Message.error(
          "Скопировать не удалось."
        );
      }
    },
    async executeUpdate() {
      this.snNotAdded = "";

      const arr = toNumberArray(this.updateList),
        replace = this.updateMode == MEASURES_LIST_REPLACE;

      if (this.updateList && !arr) {
        this.$Message.error(
          "Список системных номеров содержит некорректные данные!"
        );
        const inputRef = this.$refs.updateListInput as Vue,
          textarea = inputRef?.$refs?.textarea as HTMLTextAreaElement;
        textarea?.select();
      }

      // SN которых еще нет в списке у данного измерения
      const uniqSN = difference(arr, this.$store.state.snList.sn)

      const data: ISNList = {
        id: this.measure.id,
        sn: replace ? (arr ? arr : []) : uniqSN, // теперь без дублей, если добавление
        replace: replace,
      };

      if (!replace && uniqSN.length == 0) {
        this.$Message.error(
          "Список содержит только повторные номера. Нечего добавлять."
        );
        return;
      }

      const workModify = async () => {
        await this.$store.dispatch(SNLIST.MODIFY, data);
        // проверяем добавились ли все данные
        // 1. получаем текущий slist
        // 2. сравниваем со списком добавления
        // 3. если номера из списка добавления отсутсвуют значит сообщаем об этом
        const diff = difference(arr, this.$store.state.snList.sn); // то что не добавлено

        if (diff.length != 0) {
          this.$Message.error("Не все данные были добавлены!");
          this.snNotAdded = diff.join(", ");
        } else {
          this.$Message.info("Успешно добавлено.");
        }
      };

      if (replace) {
        this.$Modal.confirm({
          content:
            "Вы хотите полностью заменить список измеренных людей на новый?",
          okText: "Заменить",
          cancelText: "Отмена",
          onOk: workModify,
        });
      } else {
        workModify();
      }
    },
  },
});
</script>
<style lang="scss" scoped>
.measures-editor {
  .panel-switch {
    margin-top: 0.5em;
  }

  .switch-text {
    color: #c5c8ce;
    margin-left: 0.5em;
  }

  .text-enable {
    color: #2d8cf0;
    transition: opacity 0.5s;
  }

  .counter {
    text-align: right;
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
    margin-top: 0.25em;
  }

  .snlist {
    background-color: white;
    padding: 10px;
    border-radius: 4px;
  }
  .panel {
    margin-top: 1em;
  }

  .panel-error {
    color: red;
  }

  h3 {
    display: inline-block;
  }
  .panel-title {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.25em;
    align-items: flex-end;
  }
}
</style>