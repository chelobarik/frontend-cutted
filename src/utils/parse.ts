// варианты ввода данных в поля поиска:

// "123" - число, значит поиск по частичному совпадению системного номера
// "Слово" - одно слово, поиск по частичному совпадению фамилии, отображаем фамилии

// "Два Слова" - два слова, поиск по фамилии и имени
// "Слово 5555" - слово и число, частичный поиск по фамилии и году рождения

// "Три слова Введено" - поиск по фамилии имени отчеству
// "Два Слова 5555" - поиск по фамилии имени и году


type searchType = {
  fam?: string;
  name?: string;
  otch?: string;
  sn?: string;
  year?: string;
};

const
  isNumber = (s: string) => parseInt(s, 10).toString() == s,
  isRuText = (s: string) => s.replace(/[А-Я-Ё]/gim, "") == "",
  isYear = (y: number) => y < 2020 && y > 1800,
  fixYear = (y: number) =>
    y > 9 && y < 100 ? (y < 20 ? y + 2000 : y + 1900) : y;

function parseQuery(s: string): searchType {
  const q = s.split("=");
  if (q.length == 2 && q[0].toUpperCase() == "ГР") { // это запрос вида "гр=1976"
    return { year: q[1] }
  }
  return { fam: s }
}


export function parseStr(text: string): searchType | undefined {
  const v = text.trim().replace(/\s\s+/g, " "), // убираем лишние пробелы
    va = v.split(" "),
    c = va.length;

  let srch: searchType = {};
  if (v == "") return srch;

  let valid = true;

  switch (c) {
    case 1: // только одно слово, проверим число это или текст
      if (v != "")
        if (isNumber(va[0])) srch.sn = va[0];
        else srch = parseQuery(v)
      break;
    case 2: // два слова -> 1: "Фамилия Имя" или 2: "Фамилия Год_рождения" или 3:"SN Фамилия"

      if (isNumber(va[0])) { // "SN фамилия"
        srch.sn = va[0]
        srch.fam = va[1]
      } else { // вар 1 или 2
        srch.fam = va[0]
        if (isNumber(va[1])) srch.year = va[1];
        else srch.name = va[1]
      }
      break;
    case 3: // три слова -> поиск по ФИО или Фамилия Имя и год
      srch.fam = va[0];
      srch.name = va[1];
      if (isNumber(va[2])) srch.year = va[2];
      // фамилия и год рождения
      else srch.otch = va[2];
      break;
    default:
      // ошибка ввода
      valid = false;
  }

  valid = valid && (srch.fam ? isRuText(srch.fam) : true);
  valid = valid && (srch.name ? isRuText(srch.name) : true);
  valid = valid && (srch.otch ? isRuText(srch.otch) : true);
  valid = valid && (srch.year ? isYear(fixYear(+srch.year)) : true);

  if (srch.year && valid) {
    srch.year = "" + fixYear(+srch.year);
  }

  return valid ? srch : undefined
}


export function isEqualSearch(a: searchType, b: searchType): boolean {

  return a.fam === b.fam &&
    a.name === b.name &&
    a.otch === b.otch &&
    a.sn === b.sn &&
    a.year == b.year;

}