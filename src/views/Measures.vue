<template lang="pug">
.view
  h1 Данные по группам измерений
  .split-pane
    .split-pane--left
      //- Left Pane -----------------------------------

      MeasuresTree(
        :selectedID="selected.id",
        @on-select-measure="clickMeasure",
        @on-unselect-measure="selected = {}",
        @on-click-snlist="clickSnListButton",
        @on-click-remove="clickRemoveMeasure",
        @on-click-rename="clickRenameMeasure",
        @on-rename="inlineRenameMeasure",
        @on-click-add="clickAddMeasure",
        @on-click-add-folder="clickAddFolder",
        @on-click-edit-folder="clickEditFolder",
        @on-click-remove-folder="clickRemoveFolder",
        style="width: 100%"
      )

    .split-pane--right
      .split-pane--right-offset
        //- Right Pane -----------------------------------

        MeasureStatistic(
          :stat="stat",
          :title="selected.name",
          :description="selected.description",
          v-show="selected.id>0 && !measureEditor.show"
        )

        MeasuresEditor(
          v-show="selected.id>0 && measureEditor.show",
          :measure="selected",
          :editable="measureEditor.editable"
        )

  ModalMeasure(
    ref="modalMeasure",
    :param="modal",
    @measure-added="onMeasureAdded"
  )
  ModalResearchGroup(
    ref="modalAddGroup",
    v-model="groupModal",
    @on-click-ok="onModalResearchGroupClickOk"
  )
</template>

<script lang="ts">
import Vue from "vue";
import { mapGetters } from "vuex";

import { MEASURES, measureItem } from "@/store/modules/measures";
import { RESEARCH } from "@/store/modules/researches";
import { StatData } from "@/utils/measureStat";

import { SNLIST, ISNList } from "../store/modules/snList";
import { researchItem } from "../store/modules/researches";

import MeasuresTree from "@/components/measures/MeasuresTree.vue";
import MeasureStatistic from "@/components/measures/MeasureStatistic.vue";
import MeasuresEditor from "@/components/measures/MeasuresEditor.vue";
import ModalMeasure, {
  VModalMeasure,
  EditMode,
  ModalParam
} from "@/components/measures/ModalMeasure.vue";

import ModalResearchGroup, {
  ModalParam as ResModalParam
} from "@/components/measures/ModalResearchGroup.vue";

Vue.component("MeasuresTree", MeasuresTree);
Vue.component("MeasureStatistic", MeasureStatistic);
Vue.component("MeasuresEditor", MeasuresEditor);
Vue.component("ModalMeasure", ModalMeasure);
Vue.component("ModalResearchGroup", ModalResearchGroup);

export default Vue.extend({
  data() {
    return {
      selected: {} as measureItem,
      prev: {} as measureItem,

      // параметры диалога добавления/переименования измерения
      modal: {
        title: "",
        show: false,
        label: "",
        editMode: EditMode.ADD,
        measure: { id: 0, name: "", description: "" },
      } as ModalParam,

      // параметры для добавления/изменения группы
      groupModal: {
        show: false, // отобразить диалог
        mode: EditMode.ADD,
        d: {
          id: 0,
          owner: 1,
          rwgroup: 1,
          name: ""
        }
      } as ResModalParam,

      measureEditor: {
        show: false,
        editable: false // когда будем отображать snlist, то он будет readonly
         },
      stat: new StatData()
    };
  },
  computed: {
    ...mapGetters([
      "getMeasureName",
      "measures",
      "getResearchByOwner",
      "isAdmin",
      "getMeasure",
      "getResearchName",
      "getStat",
      "getResearch"
    ])
  },

  mounted() {
    this.$store.dispatch(MEASURES.INIT);
    this.$store.dispatch(RESEARCH.INIT);
  },

  methods: {
    // onModalResearchGroupClickOk - была нажата OK В модальном окне
    async onModalResearchGroupClickOk(res: ResModalParam) {
      const isAdd = res.mode === EditMode.ADD,
        ACTION = isAdd ? RESEARCH.ADD_REQUEST : RESEARCH.UPDATE_REQUEST;

      console.log("res", res);

      // пытаемся добавить новый отдел/лабораторию/группу исследований или изменить его
      try {
        (await this.$store.dispatch(ACTION, { ...res.d })) as number | void;
        this.$Message.info("Успешно!");
      } catch (error) {
        if (error instanceof Error) {
          this.$Message.error(error.toString());
        } else {
          this.$Message.error(
            "Неизвестная ошибка RESEARCH.ADD_REQUEST или RESEARCH.UPDATE_REQUEST."
          );
        }
      }
    },
    // clickAddFolder - добавляем папку с измерениями (это может делать только админ)
    clickAddFolder() {
      this.groupModal.mode = EditMode.ADD;
      const f = this.groupModal.d;
      f.id = 0;
      f.name = "";
      f.owner = 1;
      f.rwgroup = 1;
      this.groupModal.show = true;
    },

    // clickEditFolder - редактируем/изменяем папку с измерениями (это может делать только админ)
    clickEditFolder(rgid: number) {
      console.log("clickEditFolder");

      const research = this.getResearch(rgid) as researchItem;

      if (research) {
        console.log("research", research);

        Vue.set(this.groupModal, "d", { ...research});
        this.groupModal.mode = EditMode.MODIFY;
        this.groupModal.show = true;
      }
    },

    // clickRemoveFolder - удаляем папку с измерениями (это может делать только админ)
    clickRemoveFolder(rgid: number) {
      const r = this.getResearch(rgid) as researchItem;
      if (r === undefined) return;
      this.$Modal.confirm({
        title: "Удаление",
        content: `Вы хотите удалить группу «${r.name}» со всеми измерениями?`,
        okText: "Удалить",
        cancelText: "Отмена",
        closable: true,
        onOk: () => {
          this.$Message.info("Удаляем: " + r.name);
          this.$store
            .dispatch(RESEARCH.DEL_REQUEST, r.id)
            .catch(errMessage => {
              this.$Message.error(errMessage);
            });
        }
      });
    },

    inlineRenameMeasure(measure: measureItem) {
      // было выполнено переименование прямо в MeasureTree

      this.$store
        .dispatch(MEASURES.RENAME_REQUEST, { ...measure })
        .then(() => {
          this.$Message.success("Успешно!");
        })
        .catch(errMessage => {
          this.$Message.error(errMessage);
        });
    },

    clickRenameMeasure(measure: measureItem) {
      console.log("clickRenameMeasure");
      Vue.set(this, "modal", {
        title: "Переименовать измерение " + measure.name,
        label: "Новое название:",
        editMode: EditMode.MODIFY,
        orig: measure,
        measure: { ...measure },
        show: true
      } as ModalParam);

      // BUG GUI фокус глючит с валидатором, валидатор не сбрасывается
      Vue.nextTick(() => {
        const modal = this.$refs.modalMeasure as VModalMeasure;
        modal.focus();
      });
    },

    // измерение успешно добавлено в базу, обновляем редакторы
    onMeasureAdded(measure: measureItem) {
      // нужно выделить данное измерение в списке-дереве

      // очистим список snlist для текущего измерения, т.к. оно новое
      this.$store.commit(SNLIST.SUCCESS, { id: measure.id, sn: [] } as ISNList);

      this.prev = this.selected;
      this.selected = measure;
      // показываем редактор измерений
      this.measureEditor.editable = true;
      this.measureEditor.show = true;
      Vue.nextTick(() => {
        const modal = this.$refs.modalMeasure as VModalMeasure;
        modal.resetFields();
      });
    },

    // clickAddMeasure - была нажата кнопка добавления измерения "(+)"
    clickAddMeasure(rgid?: number) {
      let rname: string | undefined;
      let resID: number | undefined;

      if (rgid !== undefined) {
        rname = this.getResearchName(rgid);
        resID = rgid;
      } else {
        // возвращает Research текущего авторизированного пользователя
        const research = this.getResearchByOwner as researchItem | undefined;
        rname = research?.name;
        resID = research?.id;

        if (!research) {
          this.$Message.error(
            "Ошибка, не могу определить группу измерений."
          );
          return;
        }
      }

      Vue.set(this, "modal", {
        title: "Добавить в группу " + rname,
        label: "Измерение:",
        editMode: EditMode.ADD,
        orig: { id: 0, name: "" },
        measure: { id: 0, name: "" },
        researchID: resID,
        show: true
      } as ModalParam);

      // BUG GUI фокус глючит с валидатором, валидатор не сбрасывается
      Vue.nextTick(() => {
        const modal = this.$refs.modalMeasure as VModalMeasure;
        modal.focus();
      });
    },

    // clickMeasure - в MeasuresTree, выбрано измерение из списка
    async clickMeasure(measureID: number) {

      this.measureEditor.show = false;
      this.selected = this.getMeasure(measureID);

      // TODO API надо это убрать
      // api.loadMeasureStat(this.stat, measureID);

      const stat = this.getStat(measureID);

      if (stat) {
        this.stat = stat;
        return;
      }

      try {
        this.stat = new StatData();
        this.stat = await this.$store.dispatch(
          MEASURES.REQUEST_STATISTIC,
          measureID
        );
      } catch (error) {
        if (error instanceof Error) {
          this.$Message.error(error.toString());
        } else {
          this.$Message.error("Неизвестная ошибка MEASURES.REQUEST_STATISTIC");
        }
      }
    },

    // clickSnListButton - в MeasuresTree, нажата кнопка показать snlist
    async clickSnListButton(measure: measureItem) {
      if (this.selected == measure) {
        this.measureEditor.show = !this.measureEditor.show;
        if (!this.measureEditor.show) {
          this.selected = this.prev;
          return;
        }
      }

      this.prev = this.selected;
      this.selected = measure;

      this.measureEditor.editable =
        (this.getResearchByOwner &&
          this.getResearchByOwner.id === measure.rgid) ||
        this.isAdmin;

      this.measureEditor.show = true;

      this.$store.commit(SNLIST.SUCCESS, { id: this.selected.id, sn: [] });

      Vue.nextTick(async () => {
        try {
          await this.$store.dispatch(SNLIST.REQUEST, this.selected.id);
        } catch (error) {
          if (error instanceof Error) {
            this.$Message.error(error.toString());
          } else {
            this.$Message.error("Неизвестная ошибка SNLIST.REQUEST.");
          }
        }
      });
    },

    remove(measure: measureItem) {
      this.$Message.info("Удаляем: " + measure.name);

      this.$store
        .dispatch(MEASURES.DEL_REQUEST, measure)
        .catch(errMessage => {
          this.$Message.error(errMessage);
        });

      // GUI если есть открытый редактор, прячем его
      if (this.selected?.id === measure.id) {
        this.selected = {} as measureItem;
      }
    },

    // MeasuresTree, нажата кнопка удаления измерения на тулбаре treeitem
    clickRemoveMeasure(measure: measureItem) {
      if (measure.count && measure.count > 0) {
        this.$Modal.confirm({
          title: "Удаление",
          content: "Вы хотите удалить все измерения «" + measure.name + "» ?",
          okText: "Удалить",
          cancelText: "Отмена",
          closable: true,
          onOk: () => this.remove(measure)
        });
      } else this.remove(measure);
    }
  }
});
</script>

<style lang="scss" scoped>
.split-pane {
  display: flex;

  .split-pane--left {
    max-width: 480px;
    flex-basis: 480px;
    flex-grow: 1;

    .panel-add-button {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: flex-end;
      .add-button {
        margin-right: 0.5rem;
      }
    }
  }

  .split-pane--right {
    min-width: 300px;
    flex-grow: 5;
    border-left: 2px dotted #dcdee2;

    .split-pane--right-offset {
      margin-left: 1rem;
    }
  }
}
</style>