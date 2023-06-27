<template>
  <div class="measures-tree">
    <Tree
      ref="tree"
      :data="data5"
      class="measures-tree"
      :render="renderContent"
      @on-select-change="nodeSelect"
    />
  </div>
</template>

<script lang="ts">
/*

events:

  on-select-measure - передает (measure_id) выбранного элемента

*/

import Vue, { CreateElement, VNode } from "vue";
import { Tooltip, Tree, Icon, Button } from "view-design";
import { mapGetters } from "vuex";
import { measureItem } from "@/store/modules/measures";
import { researchItem } from "@/store/modules/researches";
import {
  TreeItem,
  RenderRoot,
  RenderFirstLevel,
  RenderSecondLevel,
  RenderData
} from "./MeasuresTreeRender";

import InlineEdit from "./InlineEditor.vue";

Vue.component("Tree", Tree);
Vue.component("Tooltip", Tooltip);
Vue.component("Icon", Icon);
Vue.component("Button", Button);
Vue.component("InlineEdit", InlineEdit);

export default Vue.extend({
  props: {
    selectedID: { type: Number, default: 0 }
  },
  data() {
    return {
      focusedItem: {} as TreeItem
    };
  },
  computed: {
    // возвращает 0 - Если это админ, >0 (id) владельца данной группы, -1 - если это не владелец
    editableResearchID(): number {
      return this.isAdmin
        ? 0
        : this.getResearchByOwner
        ? this.getResearchByOwner.id
        : -1;
    },

    data2(): TreeItem[] {
      const m = this.measures as measureItem[],
        r = this.researches as researchItem[];

      const tree = r.map(re => ({
        researchID: re.id,
        title: re.name,
        expand: re.id === this.editableResearchID,
        children: m
          .filter(me => me.rgid == re.id)
          .map(e => ({
            title: e.name,
            count: e.count,
            measureID: e.id,
            researchID: re.id,
            selected: false
          }))
      })) as TreeItem[];

      const root: TreeItem = {
        title: "Лаборатории и отделы",
        children: tree,
        expand: true
      };

      return [root];
    },

    data5(): TreeItem[] {
      const data2 = this.data2[0],
        tree = Object.assign({}, data2, {
          render: (h: CreateElement, render: RenderData) =>
            RenderRoot(h, render, this.isAdmin, () => {
              this.$emit("on-click-add-folder");
            })
        });

      return [tree];
    },

    ...mapGetters([
      "measures",
      "researches",
      "getMeasure",
      "getResearchByOwner",
      "isAdmin"
    ])
  },

  watch: {
    selectedID: function (
      newID: number | undefined,
      oldID: number | undefined
    ) {
      if (oldID === newID) return;

      if (newID === undefined) {
        //TODO если newID==undefined, то нужно выбрать предыдущий элемент из той же открытой группы
      }

      this.data5[0].children?.forEach(re => {
        re.children?.forEach(el => {
          if (el.measureID === newID) {
            re.expand = true;
            el.selected = true;
          } else {
            if (el.selected) el.selected = false;
          }
        });
      });
    }
  },

  methods: {
    onListMeasures(render: RenderData) {
      // IDEA: выделение элемента (select) на котором нажали кнопку
      const item = render.data,
        m = item.measureID ? this.getMeasure(item.measureID) : null;
      if (m) this.$emit("on-click-snlist", m);
    },

    nodeSelect(item: TreeItem[], node) {

      // IDEA: схлопывание других измерений, "гармошка"

      if ("measureID" in node) {
        this.$emit("on-select-measure", node.measureID);
        this.focusedItem = item[0];
      }

      if ("expand" in node) {

        node.selected = false;

        type dataObj = {
          handleExpand(): void;
          data?: TreeItem;
          $children: dataObj[];
        };


        const root = this.$children[0].$children[0] as unknown as dataObj;

        let el = root.$children.find(e => e.data == node);

        if (!el && root.data == node) {
          el = root as dataObj;
        }

        if (typeof el?.handleExpand === "function") el.handleExpand();
        this.$emit("on-unselect-measure");
      }
    },

    inlineRename(render: RenderData, newTitle: string) {
      const m = render.data.measureID
        ? (this.getMeasure(render.data.measureID) as measureItem)
        : null;
      console.log("rename: ", " -> ", newTitle);

      if (m && newTitle) {
        this.$emit("on-rename", { id: m?.id, name: newTitle });
      }
    },

    // Включает режим редактирования названия измерения в MeasureTree
    enableInlineEdit(render: RenderData) {
      // активируем HTML элемент input
      Vue.set(render.data, "edit", true);
      // убираем фокус, если он на другом элементе
      if (this.focusedItem) this.focusedItem.selected = false;
      // выделяем всю строку в InputEditor
      render.data.selected = true;
      // назначаем фокусным элементом, элемент где редактор строки
      this.focusedItem = render.data;
    },

    rename(render: RenderData) {
      // TODO переименование измерения

      console.log("rename measure, ", render);

      // включаем inline редактор
      // this.enableInlineEdit(render);

      const m = render.data.measureID
        ? (this.getMeasure(render.data.measureID) as measureItem)
        : null;

      if (m) this.$emit("on-click-rename", m)
    },
    append(render: RenderData) {
      const data = render.data;
      const children = data.children || [];
      children.push({
        title: "appended node",
        expand: true
      });
      this.$set(data, "children", children);
    },

    add(render: RenderData) {
      // нажата кнопка добавить измерение в группу
      const rgid = render.data.researchID;
      if (rgid !== undefined) this.$emit("on-click-add", rgid);
    },

    editGroup(render: RenderData) {
      // нажата кнопка изменить/отредактировать группу (Admin)
      const rgid = render.data.researchID;
      if (rgid !== undefined) this.$emit("on-click-edit-folder", rgid);
    },

    removeGroup(render: RenderData) {
      // нажата кнопка изменить/отредактировать группу (Admin)
      const rgid = render.data.researchID;
      if (rgid !== undefined) this.$emit("on-click-remove-folder", rgid);
    },

    remove(render: RenderData) {
      const m = render.data.measureID
        ? this.getMeasure(render.data.measureID)
        : null;
      if (m) this.$emit("on-click-remove", m);
    },

    renderContent(h: CreateElement, render: RenderData): VNode {
      let res: VNode;

      if (render.node.parent == 0) {
        res = RenderFirstLevel(
          h,
          render,
          this.editableResearchID,
          this.add,
          this.editGroup,
          this.removeGroup
        );
      } else {
        res = RenderSecondLevel(
          h,
          render,
          this.editableResearchID,
          this.inlineRename,
          this.rename,
          this.remove,
          this.onListMeasures
        );
      }

      return res;
    }
  }
});
</script>

<style lang="scss">
.measures-tree {
  /* bug: "overflow: hidden;" - из-за этого обрезается tooltip  */
  overflow: hidden;
  margin-right: 8px;
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently */
}

.measures-tree .ivu-tree-title {
  width: 100%;
}

.measures-tree .ivu-tree ul li {
  margin: 2px 0;
}

.tree-item-title-editor {
  background-color: transparent;
  border: none;
}
.tree-item-title-editor:focus {
  outline-width: 1px;
  background: white;
}
.tree-item-title {
  font-weight: 400;
}
.tree-item-meta {
  color: $flaskColor;
  padding-left: 8px;
}
</style>




