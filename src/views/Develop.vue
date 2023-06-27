<template lang="pug">
div.view
  h1 Отладка

  p.disabled Проверка редактора:
  Inline(v-model="demoText1", :focused="editFocused", @blur="editFocused=false", @change="needRename")
  Button(icon="md-create",@click="clickRename")

  p result: {{demoText1}}

</template>

<script lang="ts">
import Vue from "vue";

import Inline from "@/components/measures/InlineEditor.vue";
import { Button, Icon } from "view-design";
Vue.component("Inline", Inline);
Vue.component("Button", Button);
Vue.component("Icon", Icon);

export default Vue.extend({
  data() {
    return {
      demoText1: "proverka1",
      editFocused: false
    };
  },
  methods: {
    needRename() {
      window.alert("need rename to " + this.demoText1);
    },

    clickRename(event) {
      this.editFocused = true;
      event.stopPropagation();
    }
  }
});
</script>

<style scoped>
.disabled {
  user-select: none;
}
</style>