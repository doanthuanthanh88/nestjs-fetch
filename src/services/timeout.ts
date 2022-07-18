export class Timeout {
  private tm: NodeJS.Timeout

  constructor(private timeout: number, private ontimeout: () => any) {
  }

  toPromise() {
    return new Promise<never>((_, reject) => {
      this.tm = setTimeout(() => {
        reject(new Error(`Timeout > ${this.timeout}ms`))
        return this.ontimeout()
      }, this.timeout)
    })
  }

  dispose() {
    this.tm && clearTimeout(this.tm)
  }

}