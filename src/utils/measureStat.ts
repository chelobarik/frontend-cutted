export type Counter = {
      key: number;
      count: number;
}

export type Statistic = {
      total: number;
      super: number;
      fib: number;
      ekr: number;
      crs: number;
      exposed: Counter[];
      lifestatus: Counter[];
      ambulcard: number;
      historycard: number;
      formalcard: number;
}

export class StatData {
      super: number
      total: number
      fib: number
      ekr: number
      crs: number
      dead: number
      alive: number
      doseGroup: Counter[]
      ambulcard: number
      historycard: number
      formalcard: number

      constructor(stat?: Statistic) {
            this.super = 0
            this.total = 0
            this.fib = 0
            this.ekr = 0
            this.crs = 0
            this.dead = 0
            this.alive = 0
            this.doseGroup = Array.from([0, 1, 2, 3], n => ({ count: 0, key: n } as Counter))
            this.ambulcard = 0
            this.historycard = 0
            this.formalcard = 0

            if (stat == undefined) return;

            this.super = stat.super
            this.total = stat.total
            this.fib = stat.fib
            this.ekr = stat.ekr
            this.crs = stat.crs
            this.ambulcard = stat.ambulcard
            this.historycard = stat.historycard
            this.formalcard = stat.formalcard            

            // (1 - жив, 3 - умер)
            this.dead = this.getCount(stat.lifestatus, 3)
            this.alive = this.getCount(stat.lifestatus, 1)
            this.doseGroup = Array.from([0, 1, 2, 3],
                  n => ({ count: this.getCount(stat.exposed, n), key: n })
            );
      }

      getCount(arr: Counter[], key: number): number {
            const el = arr.find(e => e.key === key);
            return (el && el?.count > 0) ? el.count : 0;
      }
}