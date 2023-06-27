export function normalizeDiagnozList(listStr: string) {
  return listStr.split(/[\s,;]+/).map(e => {
    const a = e.split(".")
    return { klass: a[0], rubrika: a[1], podrubrika: a[1] }
  })
}
