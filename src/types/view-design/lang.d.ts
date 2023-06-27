interface ILang {
  i: {
      locale: string;
      select: {
          placeholder: string;
          noMatch: string;
          loading: string;
      };
      table: {
          noDataText: string;
          noFilteredDataText: string;
          confirmFilter: string;
          resetFilter: string;
          clearFilter: string;
          sumText: string;
      };
      datepicker: {
          selectDate: string;
          selectTime: string;
          startTime: string;
          endTime: string;
          clear: string;
          ok: string;
          datePanelLabel: string;
          month: string;
          month1: string;
          month2: string;
          month3: string;
          month4: string;
          month5: string;
          month6: string;
          month7: string;
          month8: string;
          month9: string;
          month10: string;
          month11: string;
          month12: string;
          year: string;
          weekStartDay: string;
          weeks: {
              sun: string;
              mon: string;
              tue: string;
              wed: string;
              thu: string;
              fri: string;
              sat: string;
          };
          months: {
              m1: string;
              m2: string;
              m3: string;
              m4: string;
              m5: string;
              m6: string;
              m7: string;
              m8: string;
              m9: string;
              m10: string;
              m11: string;
              m12: string;
          };
      };
      transfer: {
          titles: {
              source: string;
              target: string;
          };
          filterPlaceholder: string;
          notFoundText: string;
      };
      modal: {
          okText: string;
          cancelText: string;
      };
      poptip: {
          okText: string;
          cancelText: string;
      };
      page: {
          prev: string;
          next: string;
          total: string;
          item: string;
          items: string;
          prev5: string;
          next5: string;
          page: string;
          goto: string;
          p: string;
      };
      rate: {
          star: string;
          stars: string;
      };
      tree: {
          emptyText: string;
      };
  };
}

declare module 'view-design/dist/locale/en-US' {
  const lang: ILang;
  export = lang;
}

declare module 'view-design/dist/locale/ru-RU' {
  const lang: ILang;
  export = lang;
}