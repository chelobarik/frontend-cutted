<template lang="pug">
  div.inline-editor
    span(v-show="disabled") {{value}}
    input(v-show="!disabled", ref="nativeInput", v-bind="$attrs", v-bind:value="value"
      v-on="inputListeners")
</template>
<script lang="ts">
import Vue from "vue";

import { ChangeEvent } from "@/utils/types";

export default Vue.extend({
  props: {
    value: { type: String, default: "" },
    focused: Boolean
  },
  data() {
    return {
      disabled: true,
      text: "",
      old: "",
      timeoutId: 0
    };
  },
  computed: {
    inputListeners() {
      const vm = (this as unknown) as Vue & {
        text: string;
        value: string;
        old: string;
        disabled: boolean;
      };
      return Object.assign(
        {},
        // Мы добавляем все слушатели из родителя
        this.$listeners,
        // Затем мы можем добавить собственные слушатели или
        // перезаписать поведение некоторых существующих.
        {
          // Это обеспечит, что будет работать v-model на компоненте
          input(event) {
            vm.$emit("input", event.target.value);
            vm.text = event.target.value;
          },
          focusin(event) {
            vm.old = vm.value;
            vm.$emit("focusin", event);
          },

          change(e: ChangeEvent) {
            console.log("change - old:", vm.old, " new:", vm.text);
            e.data = vm.text;
            if (vm.old !== vm.text) {
              vm.$emit("change", e);
            }
          },

          blur(event) {
            vm.disabled = true;
            vm.$emit("blur", event);
          },

          keyup(event: KeyboardEvent) {
            const k = event.keyCode;
            if (k == 13 || k == 27) {
              if (k == 27) {
                vm.text = vm.old;
                vm.$emit("input", vm.old);
              }
              event.stopPropagation();
              const editor = vm.$refs.nativeInput as HTMLTextAreaElement;
              if (typeof editor.blur === "function") editor.blur();
            }
          }
        }
      );
    }
  },

  watch: {
    focused: function(newValue, oldValue: boolean) {
      if (oldValue === newValue) return;
      if (newValue) {
        this.disabled = false;
        Vue.nextTick(() => {
          this.focus();
        });
      }
    }
  },
  methods: {
    focus() {
      const editor = this.$refs.nativeInput as HTMLTextAreaElement;
      editor.focus();
      editor.select();
    }
  }
});
</script>

<style lang="scss" scoped>
.inline-editor {
  user-select: none;

  span,
  input {
    padding-left: 8px;
  }

  input {
    background-color: transparent;
    border: none;
    border-radius: 2px;
    width: 15em;
  }

  input:focus {
    outline: 2px #9ecaed solid;
    outline: 5px auto -webkit-focus-ring-color;
    background: white;
  }
}
</style>