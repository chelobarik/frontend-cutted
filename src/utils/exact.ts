/**
 * Возвращает массив элементов из A, которых нет в B
 *
 * @param {T[]} searchArray - массив в котором ищем элементы
 * @param {T[]} whatSearching - массив элементов, которые ищем
 * @returns {T[]} возвращает элементы из searchArray которые отсутствуют в whatSearching
 */
export function exact<T>(searchArray: T[], whatSearching: T[] | null): T[] {
    return whatSearching ? searchArray.filter(e => whatSearching.indexOf(e) < 0) : searchArray
}

/**
 * Возвращает наиболее часто встречаемы символ в searchString из набора splitChar или null,
 *  если таковой не встретился.
 * Используется для автоматического выбора символа разделения строки на подэлементы.
 * @param {string} searchString - строка в которой ищем символы разбиения
 * @param {string} splitChars - строка содержащие возможные символы разбиения
 * @returns {(string | null)}
 */
export function findSplitChar(searchString: string, splitChars: string): string | null {
    let max = 0,
        char: string | null = null
    //eslint-disable-next-line
    const s1 = searchString.trim().replace(/\s\s+/g, ' ') // убираем повторные пробелы

    function check(c: string) {
        const arr = s1.match(new RegExp(c, "g")),
            count = arr ? arr.length : 0

        if (count > max) {
            max = count
            char = c
        }
    }

    // проверка без пробела
    splitChars.split('').filter(e => e != ' ').forEach(check)

    if (max > 0) return char

    // проверка для пробела
    if (splitChars.indexOf(" ") > -1) check(" ")

    return char
}

export function splitStr(s: string, splitChar: string): number[] | null {
    // уберем двойные пробелы если разбитие про пробелу,
    // в противном случае уберем все пробелы

    let ss: string

    if (splitChar == " ") {
        ss = s.trim().replace(/\s\s+/g, ' ')
    } else {
        //eslint-disable-next-line
        ss = s.trim().replace(new RegExp(`\s*${splitChar}\s*`, "g"), splitChar)
    }

    const res = ss.split(splitChar).map(e => +e)

    return res.includes(NaN) || res.includes(0) ? null : res
}

export function toNumberArray(str: string): number[] | null {
    const s = str.replace(/\n/g, ' ').trim()

    if (s.indexOf(',') > -1) {
        return splitStr(s, ',')
    } else if (s.indexOf(';') > -1) {
        return splitStr(s, ';')
    }

    return splitStr(s, ' ')
}


export function ageStr(age: number): string {
    let txt: string,
        count = age % 100;
    if (count >= 5 && count <= 20) {
        txt = ' лет';
    } else {
        count = count % 10;
        if (count == 1) {
            txt = ' год';
        } else if (count >= 2 && count <= 4) {
            txt = ' года';
        } else {
            txt = ' лет';
        }
    }
    return age + txt;
}