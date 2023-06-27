import { CreateElement, VNode, VNodeChildren } from "vue";
import Vue from 'vue';

import { ChangeEvent } from "@/utils/types";


export type RenderData = {
  root: RenderItem[];
  node: RenderItem;
  data: TreeItem;
};

type RenderItem = {
  children: number[];
  node: TreeItem;
  nodeKey: number;
  parent?: number;
};

export type TreeItem = {
  title: string;
  edit?: boolean; // включаем редактор title
  count?: number;
  expand?: boolean;
  selected?: boolean;
  children?: TreeItem[];
  measureID?: number; // id - измерения
  researchID?: number; // id - группы измерений
  render?: (h: CreateElement, render: RenderItem) => VNode;
};

const ToolTip = (h: CreateElement, title: string, children: VNode): VNode =>
  h("Tooltip", { props: { content: title, delay: 1000 } }, [children])

const Button = (h: CreateElement, props: object | object[] | undefined, style: string | object | object[] | undefined, onClick: (event: Event) => void): VNode =>
  h("Button", {
    props: props,
    style: style,
    on: {
      click: (event: Event) => {
        onClick(event);
        event.stopPropagation();
      }
    }
  });

function buttonsBarSecondLevel(h: CreateElement,
  render: RenderData,
  researchOwner: number, // 0 - admin
  onRename: (render: RenderData) => void,
  onRemove: (render: RenderData) => void,
  onList: (render: RenderData) => void,
): VNodeChildren {

  const isOwner = (render.data.researchID === researchOwner) || (researchOwner === 0);

  const buttons = {

    rename: ToolTip(h, "Переименовать",
      Button(h, { icon: "md-create" }, { marginRight: "8px" }, () => onRename(render))
    ),
    list: ToolTip(h, "Список измеренных людей",
      Button(h, { icon: "md-list-box" }, { marginRight: isOwner ? "8px" : "0" }, () => onList(render))
    ),
    delete: ToolTip(h, "Удалить",
      Button(h, { icon: "md-trash" }, undefined, () => onRemove(render))
    ),

  }
  // если пользователь - владелец отображаемой группы, нужно добавить все кнопки редактирования,
  // иначе отображаем только кнопку "показать список измеренных людей"
  return isOwner ? [Object.values(buttons)] : [buttons.list];
}

function buttonsBarLevelOne(h: CreateElement,
  render: RenderData,
  researchOwner: number, // 0 - admin
  onAdd: (render: RenderData) => void,
  onEdit: (render: RenderData) => void,
  onRemoveGroup: (render: RenderData) => void,
): VNodeChildren {

  const
    isAdmin = researchOwner === 0,
    isOwner = (render.data.researchID === researchOwner) || isAdmin

  const buttons = {

    edit: ToolTip(h, "Изменить...",
      Button(h, { icon: "md-create" }, { marginRight: "8px" }, () => onEdit(render))
    ),
    delete: ToolTip(h, "Удалить",
      Button(h, { icon: "md-trash" }, { marginRight: "8px" }, () => onRemoveGroup(render))
    ),
    add: ToolTip(h, "Добавить группу измерений",
      Button(h, { icon: "md-add", shape: "circle", type: !isAdmin ? "primary" : undefined }, undefined, () => onAdd(render))
    )
  }
  return isAdmin ? [Object.values(buttons)] : isOwner ? [buttons.add] : undefined
}


// RenderFirstLevel - рендер элементов дерева первого уровня
// элементы рендера либо без кнопок, либо есть кнопка "добавить"
// (когда текущий пользователь - владелец отображаемой группы (onAdd)
// когда админ - есть кнопка редактировать! (onEdit)
export function RenderFirstLevel(
  h: CreateElement,
  render: RenderData,
  researchOwner: number, // если пользователь владелец отображаемой группы, нужно будет добавить кнопки редактирования
  onAdd: (render: RenderData) => void,
  onEdit: (render: RenderData) => void,
  onRemoveGroup: (render: RenderData) => void,
): VNode {

  const
    hasExpand = render.data.expand && render.data.children && render.data.children.length > 0,
    icon = hasExpand ? "md-folder-open" : "md-folder",
    font = "400",
    isAdmin = researchOwner === 0,
    isOwner = (render.data.researchID === researchOwner) || isAdmin

  return h(
    "span",
    {
      style: {
        display: "flex",
        justifyContent: "space-between",
        padding: "4px",
        userSelect: "none",
      }
    },
    [
      h("span", [
        h("Icon", {
          props: {
            type: icon,
            size: "24"
          },
          style: {
            marginRight: "8px",
          }
        }),
        h("span", {
          style: {
            fontWeight: font,
          },
          domProps: {
            innerHTML: render.data.title
          },
        }
        )
      ]),
      !isOwner ? undefined :
        h(
          "span",
          {
            style: {
              marginRight: "24px",
              display: 'flex',
              alignItems: 'center'
            }
          }, buttonsBarLevelOne(h, render, researchOwner, onAdd, onEdit, onRemoveGroup)
        )
    ]
  );

}

// Для элементов дерева второго уровня, они с кнопками
export function RenderSecondLevel(h: CreateElement,
  render: RenderData,
  researchOwner: number, // пользователь владельцем группы, нужно будет добавить кнопки редактирования
  inlineRename: (render: RenderData, newTitle: string) => void,
  onRename: (render: RenderData) => void,
  onRemove: (render: RenderData) => void,
  onList: (render: RenderData) => void,
): VNode {

  return h(
    "span",
    {
      style: {
        display: "flex",
        justifyContent: "space-between",
        padding: "4px",
        paddingLeft: "6px",
        userSelect: "none",
      }
    },
    [
      h("span", {
        style: {
          display: "flex",
          alignItems: "center",
        }
      }, [
        h("Icon", {
          props: {
            type: "md-flask",
            size: "24"
          },
          style: {
            marginRight: "2px",
            color: "rgba(0,50,120,.30)"
          }
        }),
        h("span", {
          style: {
            display: "flex",
            flexDirection: "column",
          }
        }, [

          h("InlineEdit", {
            props: {
              value: render.data.title,
              focused: render.data.edit,
              disabled: !render.data.edit
            },
            on: {
              blur: () => {
                Vue.delete(render.data, 'edit');
              },
              change: (e: ChangeEvent) => {
                inlineRename(render, e.data)
              }
            }
          }),

          h("span", { class: "tree-item-meta" }, 'Кол-во людей: ' + (render.data.count ? render.data.count : 0))
        ])
      ]),
      h(
        "span",
        {
          style: {
            marginRight: "24px",
            display: 'flex',
            alignItems: 'center'
          }
        },
        buttonsBarSecondLevel(h, render, researchOwner, onRename, onRemove, onList)
      )
    ]
  )
}

// Корневой элемент, у него жирный шрифт
export function RenderRoot(h: CreateElement, render: RenderData, isAdmin: boolean, onClick: () => void): VNode {
  return h("span",
    {

      style: {
        display: "flex",
        justifyContent: "space-between",
        padding: "4px",
        paddingLeft: "6px",
        userSelect: "none",
        fontWeight: "600",
      }
    },
    [
      h("span", [
        h("Icon", {
          props: {
            type: render.data.expand ? "md-folder-open" : "md-folder",
            size: "24"
          },
          style: {
            marginRight: "8px"
          }
        }),
        h("span", render.data.title)
      ]),
      isAdmin ?
        h(
          "span",
          {
            style: {
              marginRight: "24px",
              display: 'flex',
              alignItems: 'center'
            }
          }, [
          ToolTip(h, 'Добавить папку',
            Button(h, {
              icon: "md-add",
              shape: "circle",
            }, undefined, () => onClick()))]
        ) : undefined
    ]
  );
}