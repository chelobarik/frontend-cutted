<template lang="pug">
.view
	h1 Конструктор выборок

	Form(:label-width="120", style="max-width: 60em")
		//- Персональная информация (национальность, пол, дата рождения)

		FormItem.shrink(label="Персональная информация")
			Checkbox(v-model="form.personal.enable") Выбрать
				CheckboxGroup(
					v-model="form.personal.checkbox",
					style="margin-left: 20px",
					v-show="form.personal.enable"
				)
					Row
						Checkbox(label="sex", v-model="form.personal.sex") Пол:
						Checkbox(label="sex-male", :disabled="!form.personal.sex") Мужской
						Checkbox(label="sex-female", :disabled="!form.personal.sex") Женский
					Row
						Checkbox(label="age", v-model="form.personal.age.enable") Год рождения:
						Col(span="1", style="text-align: center") с
						Col(span="5")
							Input(
								v-model="form.personal.age.from",
								:disabled="!form.personal.age.enable"
							)
						Col(span="1", style="text-align: center") по
						Col(span="5")
							Input(
								v-model="form.personal.age.to",
								:disabled="!form.personal.age.enable"
							)
					Row
						Checkbox(label="ethnic", v-model="form.personal.ethnic") Национальность:
						Checkbox(label="ethnic-0", :disabled="!form.personal.ethnic") Тюркиты
						Checkbox(label="ethnic-1", :disabled="!form.personal.ethnic") Славяне
						Checkbox(label="ethnic-8", :disabled="!form.personal.ethnic") Прочие

		//- Жизненный статус

		FormItem.shrink(label="Статус")
			Checkbox(v-model="form.liveStatus.enable") Поиск по статусу
			Row(v-show="form.liveStatus.enable")
				Checkbox(
					style="margin=left: 20px",
					:indeterminate="liveStatus.indeterminate",
					:value="liveStatus.statusAll",
					@click.prevent.native="handleCheckAll"
				) Жизненный статус
			Row(v-show="form.liveStatus.enable")
				Col(span="1")
				Col
					CheckboxGroup(
						v-model="form.liveStatus.checkbox",
						@on-change="checkAllGroupChange",
						style="margin=left: 20px"
					)
						Checkbox(label="status-1") Жив
						Checkbox(label="status-3") Умер, причина установлена
						Checkbox(label="status-4") Умер, причина неизвестна
			Row(v-show="form.liveStatus.enable")
				Checkbox(
					v-model="form.liveStatus.date.enable",
					style="margin-top: 0.5em"
				) Год статуса (включительно)
			Row(v-show="form.liveStatus.enable")
				Col(span="1", style="text-align: center") с
				Col(span="5")
					Input(
						v-model="form.liveStatus.date.from",
						:disabled="!form.liveStatus.date.enable"
					)
				Col(span="1", style="text-align: center") по
				Col(span="5")
					Input(
						v-model="form.liveStatus.date.to",
						:disabled="!form.liveStatus.date.enable"
					)

		//- Контактная информация

		FormItem.shrink(label="Контактная информация")
			Checkbox(v-model="form.contacts.enable") Наличие информации
			CheckboxGroup(
				v-model="form.contacts.checkbox",
				v-show="form.contacts.enable",
				style="margin-left: 20px"
			)
				Row
					Col(span="4")
						Checkbox(label="address", :disabled="!form.contacts.enable") Адрес
					Col(span="6")
						Checkbox(label="phone", :disabled="!form.contacts.enable") Телефон

		//- Облучение

		FormItem.shrink(label="Облучение")
			Checkbox(v-model="form.groupExposed.enable") Включить в поиск группы обучения
			CheckboxGroup(
				v-model="form.groupExposed.checkbox",
				v-show="form.groupExposed.enable",
				style="margin-left: 20px"
			)
				Row
					Checkbox(label="0", :disabled="!form.groupExposed.enable") Облучены, доза не восстановлена
				Row
					Checkbox(label="1", :disabled="!form.groupExposed.enable") Облучены, доза восстановлена
				Row
					Checkbox(label="2", :disabled="!form.groupExposed.enable") Потомки облученных
				Row
					Checkbox(label="3", :disabled="!form.groupExposed.enable") Ликвидаторы и их потомки
				Row
					Checkbox(label="4", :disabled="!form.groupExposed.enable") Приехали после 1960 года в НП по р.Теча или ВУРС
				Row
					Checkbox(label="5", :disabled="!form.groupExposed.enable") Возможно были облучены, но информации о местах и сроках не известна
				Row
					Checkbox(label="6", :disabled="!form.groupExposed.enable") Потенциальный контроль

		//- Проживание

		FormItem.shrink(label="Проживание")
			Checkbox(v-model="form.location.enable") Включить в поиск область проживания
			CheckboxGroup(
				v-model="form.location.checkbox",
				style="margin-left: 20px",
				v-show="form.location.enable"
			)
				Row
					Checkbox(label="1", :disabled="!form.location.enable") Челябинская обл.
				Row
					Checkbox(label="2", :disabled="!form.location.enable") Курганская обл.
				Row
					Checkbox(label="3", :disabled="!form.location.enable") Свердловская обл.
				Row
					Checkbox(label="4", :disabled="!form.location.enable") За пределами 3-х областей

		//-  Диагнозы

		FormItem.shrink(label="Диагнозы")
			Checkbox(v-model="form.diagnoz.enable") Учитывать
			CheckboxGroup(
				v-model="form.diagnoz.checkbox",
				style="margin-left: 20px",
				v-show="form.diagnoz.enable"
			)
				Row
					Col(span="7")
					Col(span="8") МКБ-9 (ФИБ)
					Col(span="8") МКБ-10 (ЕКР)
				Row
					Col(span="7")
						Tooltip(
							placement="top",
							max-width="200",
							content="Любой диагноз из списка (через пробел)"
						)
							Checkbox(
								label="present",
								:disabled="!form.diagnoz.enable",
								v-model="form.diagnoz.present.enable"
							) Наличие диагноза:
					Col(span="8")
						Input(
							v-model="form.diagnoz.present.fib",
							style="width: 14em",
							:disabled="!form.diagnoz.present.enable",
							placeholder="XX.XXX  XX.XXX.X"
						)
					Col(span="8")
						Input(
							v-model="form.diagnoz.present.ekr",
							style="width: 14em",
							:disabled="!form.diagnoz.present.enable",
							placeholder="XXX  XXX.XX"
						)
				Row
					Col(span="7")
						Tooltip(
							placement="top",
							max-width="200",
							content="Всех из списка (через пробел)"
						)
							Checkbox(
								label="absent",
								:disabled="!form.diagnoz.enable",
								v-model="form.diagnoz.absent.enable"
							) Отсутствие диагнозов:
					Col(span="8")
						Tooltip
						Input(
							v-model="form.diagnoz.absent.fib",
							style="width: 14em",
							:disabled="!form.diagnoz.absent.enable",
							placeholder="XX.XXX  XX.XXX.X"
						)
					Col(span="8")
						Input(
							v-model="form.diagnoz.absent.ekr",
							style="width: 14em",
							:disabled="!form.diagnoz.absent.enable",
							placeholder="XXX  XXX.XX"
						)
				Row(style="margin-top: 1em")

		//- Дозы на ККМ

		FormItem.shrink(label="Дозы на ККМ")
			Checkbox(v-model="form.doseRbm.enable") Учитывать дозы на ККМ
			CheckboxGroup(
				v-model="form.doseRbm.checkbox",
				style="margin-left: 20px",
				v-show="form.doseRbm.enable"
			)
				Row
					Col(span="8")
						Checkbox(
							label="acc-rbm",
							:disabled="!form.doseRbm.enable",
							v-model="form.doseRbm.acc.enable"
						) Накопленная доза
					Col
						Input(
							v-model="form.doseRbm.acc.from",
							style="width: 10em",
							:disabled="!form.doseRbm.acc.enable",
							placeholder="0"
						)
							span(slot="prepend") от
							span(slot="append") Гр
					Col
						Input(
							v-model="form.doseRbm.acc.to",
							style="width: 10em; margin-left: 1em",
							:disabled="!form.doseRbm.acc.enable",
							placeholder="7.92 max"
						)
							span(slot="prepend") до
							span(slot="append") Гр
					Col(style="margin-left: 0.5em; color: #777") (включительно)
				Row
					Col(span="8")
						Checkbox(
							label="rate-rbm",
							:disabled="!form.doseRbm.enable",
							v-model="form.doseRbm.rate.enable"
						) Мощность дозы, max Гр/год
					Col
						Input(
							v-model="form.doseRbm.rate.from",
							style="width: 10em",
							:disabled="!form.doseRbm.rate.enable",
							placeholder="0"
						)
							span(slot="prepend") от
							span(slot="append") Гр/год
					Col
						Input(
							v-model="form.doseRbm.rate.to",
							style="width: 10em; margin-left: 1em",
							:disabled="!form.doseRbm.rate.enable",
							placeholder="1.45 max"
						)
							span(slot="prepend") до
							span(slot="append") Гр/год
					Col(style="margin-left: 0.5em; color: #777") (включительно)

		//- Дозы на мягкие ткани

		FormItem.shrink(label="Дозы на мягкие ткани")
			Checkbox(v-model="form.doseSt.enable") Учитывать дозы на мягкие ткани
			CheckboxGroup(
				v-model="form.doseSt.checkbox",
				style="margin-left: 20px",
				v-show="form.doseSt.enable"
			)
				Row
					Col(span="8")
						Checkbox(
							label="acc-rbm",
							:disabled="!form.doseSt.enable",
							v-model="form.doseSt.acc.enable"
						) Накопленная доза
					Col
						Input(
							v-model="form.doseSt.acc.from",
							style="width: 10em",
							:disabled="!form.doseSt.acc.enable",
							placeholder="0"
						)
							span(slot="prepend") от
							span(slot="append") Гр
					Col
						Input(
							v-model="form.doseSt.acc.to",
							style="width: 10em; margin-left: 1em",
							:disabled="!form.doseSt.acc.enable",
							placeholder="1.13 max"
						)
							span(slot="prepend") до
							span(slot="append") Гр
					Col(style="margin-left: 0.5em; color: #777") (включительно)
				Row
					Col(span="8")
						Checkbox(
							label="rate-rbm",
							:disabled="!form.doseSt.enable",
							v-model="form.doseSt.rate.enable"
						) Мощность дозы, max Гр/год
					Col
						Input(
							v-model="form.doseSt.rate.from",
							style="width: 10em",
							:disabled="!form.doseSt.rate.enable",
							placeholder="0"
						)
							span(slot="prepend") от
							span(slot="append") Гр/год
					Col
						Input(
							v-model="form.doseSt.rate.to",
							style="width: 10em; margin-left: 1em",
							:disabled="!form.doseSt.rate.enable",
							placeholder="0.61 max"
						)
							span(slot="prepend") до
							span(slot="append") Гр/год
					Col(style="margin-left: 0.5em; color: #777") (включительно)

	//- Кнопки

	Row(style="margin-top: 1em")
		Col(style="margin-left: 16px")
			Button(
				type="primary",
				@click="handleSubmit",
				:disabled="!anyFormItemChecked"
			) Поиск
			Button(
				@click="handleReset",
				style="margin-left: 20px",
				:disabled="!anyFormItemChecked"
			) Очистить
	Form.shrink.green(v-show="res || notFound", style="margin-top: 14px")
		Row(type="flex", justify="space-between")
			Col
				h2.result Результаты поиска
			Col(span)
				Tooltip(content="Загрузить в виде файла")
					Button(icon="md-download", @click="downloadResult", :disabled="!res")
				Tooltip(content="Скопировать список")
					Button(
						style="margin: 6px 14px",
						icon="md-copy",
						:disabled="!res",
						@click="copyResult"
					)
		Row
			.result(style="margin-top: 0") Общее кол-во: {{ resultCount }}
		Row
			Col(span="24")
				FormItem(style="margin: 6px 14px; border-radius: 8px")
					Input(
						style="margin-bottom: 6px",
						:value="result",
						type="textarea",
						:rows="5",
						placeholder="Enter something..."
					)
</template>

<script lang="ts">
import Vue from "vue";
import { mapGetters } from "vuex";

import locale from "view-design/src/components/locale";
import lang from "view-design/dist/locale/ru-RU";

import {
	Input,
	Icon,
	Modal,
	CheckboxGroup,
	Checkbox,
	Form,
	FormItem,
	Row,
	Col,
	Button,
	Radio,
	RadioGroup,
	Divider,
	Tooltip,
} from "view-design";

import {
	FACETED_SEARCH,
	facetedSearchResult,
	IFacetedSearchForm,
	state as facetedSearchState,
} from "@/store/modules/facetedSearch";
import cloneDeep from "lodash.clonedeep";

locale(lang);

Vue.component("Input", Input);
Vue.component("Icon", Icon);
Vue.component("Modal", Modal);
Vue.component("CheckboxGroup", CheckboxGroup);
Vue.component("Checkbox", Checkbox);
Vue.component("Form", Form);
Vue.component("FormItem", FormItem);
Vue.component("Row", Row);
Vue.component("Col", Col);
Vue.component("Button", Button);
Vue.component("Radio", Radio);
Vue.component("RadioGroup", RadioGroup);
Vue.component("Divider", Divider);
Vue.component("Tooltip", Tooltip);

Vue.prototype.$Modal =
	typeof Vue.prototype.$Modal == "undefined" ? Modal : Vue.prototype.$Modal;

declare module "vue/types/vue" {
	// eslint-disable-next-line @typescript-eslint/interface-name-prefix
	interface Vue {
		form: IFacetedSearchForm;
		res: facetedSearchResult | undefined;
		getForm: IFacetedSearchForm;
		getResult: facetedSearchResult;
	}
}

export default Vue.extend({
	props: {
		sn: {
			type: Number,
			default: 0,
		},
	},

	mounted() {
		this.form = this.getForm;
		this.res = this.getResult;
	},

	data() {
		return {
			res: cloneDeep(facetedSearchState.res) as facetedSearchResult | undefined,
			notFound: false,
			liveStatus: {
				statusAll: false,
				indeterminate: true,
			},
			form: cloneDeep(facetedSearchState.form) as IFacetedSearchForm,
		};
	},

	computed: {
		result(): string {
			return this.res && Array.isArray(this.res.sn_list)
				? this.res.sn_list.join(", ")
				: "ничего не найдено";
		},
		resultCount(): string | number {
			return this.res
				? this.res.count >= 10000
					? "более 10000 (отображены первые 10000)"
					: this.res.count
				: "";
		},
		anyFormItemChecked(): boolean {
			const f = this.form
			return f.personal.enable ||
				f.liveStatus.enable ||
				f.contacts.enable ||
				f.groupExposed.enable ||
				f.location.enable ||
				f.diagnoz.enable ||
				f.doseRbm.enable ||
				f.doseSt.enable
		},
	...mapGetters("facetedSearch", ["getForm", "getResult"]),
},

	methods: {
	async searchRequest(search: Partial<IFacetedSearchForm>) {

		try {

			this.res = (await this.$store.dispatch(
				`facetedSearch/${FACETED_SEARCH.REQUEST}`,
				search
			)) as facetedSearchResult;

			this.notFound = !Array.isArray(this.res?.sn_list);
			this.$Message.success("Успешно!");
		} catch {
			// ошибка при поиске, ничего не найдено
			this.res = undefined;
			this.notFound = false;
			this.$Message.error("Ошибка поиска!");
		}
	},

	handleCheckAll() {
		if (this.liveStatus.indeterminate) this.liveStatus.statusAll = false;
		else this.liveStatus.statusAll = !this.liveStatus.statusAll;

		this.liveStatus.indeterminate = false;

		if (this.liveStatus.statusAll) {
			this.form.liveStatus.checkbox = ["status-1", "status-3", "status-4"];
		} else {
			this.form.liveStatus.checkbox = [];
		}
	},
	checkAllGroupChange(data) {
		if (data.length === 3) {
			this.liveStatus.indeterminate = false;
			this.liveStatus.statusAll = true;
		} else if (data.length > 0) {
			this.liveStatus.indeterminate = true;
			this.liveStatus.statusAll = false;
		} else {
			this.liveStatus.indeterminate = false;
			this.liveStatus.statusAll = false;
		}
	},
	handleSubmit() {
		const search = {} as Partial<IFacetedSearchForm>;

		this.form.liveStatus.status =
			this.liveStatus.statusAll || this.liveStatus.indeterminate;

		Object.keys(this.form).forEach((key) => {
			if (this.form[key].enable) {
				search[key] = this.form[key];
			}
		});

		this.searchRequest(search);
	},

	handleReset() {
		this.form.personal.enable = false;
		this.form.liveStatus.enable = false;
		this.form.contacts.enable = false;
		this.form.groupExposed.enable = false;
		this.form.location.enable = false;
		this.form.diagnoz.enable = false;
		this.form.doseRbm.enable = false;
		this.form.doseSt.enable = false;
		this.res = undefined;
	},
	downloadResult() {
		const txtData = this.res ? this.res.sn_list.join("%0A") : "",
			element = document.createElement("a");
		element.setAttribute(
			"href",
			"data:text/plain;charset=windows-1251," + txtData
		);
		element.setAttribute("download", "result.lst");
		element.style.display = "none";
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	},
	copyResult() {
		const txtData = this.res ? this.res.sn_list.join("\n") : "";
		navigator.clipboard.writeText(txtData).then(
			() => {
				this.$Message.success("Скопировано успешно!");
			},
			() => {
				this.$Message.error("Скопировать не удалось!");
			}
		);
	},
},
});
</script>

<style lang="scss" scoped>
.shrink {
	margin-top: 8px;
	margin-bottom: 8px;
	border: 1px solid #ccc;
	border-radius: 8px;
	background-color: #ddd;
}

.result {
	margin: 6px 14px;
	color: #555;
}

.green {
	background-color: #cbdbc6;
}

label.ivu-checkbox-wrapper {
	user-select: none;

	&>span {
		user-select: none;
	}
}
</style>
