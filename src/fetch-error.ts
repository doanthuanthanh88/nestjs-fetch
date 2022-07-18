
export class FetchError extends Error {
  url: string
  method: string
  status?: number
  statusText?: string
  params?: string
  headers?: { [key: string]: string }
  body?: any

  responseHeaders?: { [key: string]: string }
  response?: any
  serviceName?: string

  constructor(message: string, infor?: Partial<FetchError>) {
    super(message)
    if (infor) Object.assign(this, infor)
    this.name = `${FetchError.name}` + (this.serviceName ? `(${this.serviceName})` : '')
  }
}