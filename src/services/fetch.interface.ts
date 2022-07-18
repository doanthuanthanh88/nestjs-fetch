
export interface Fetch<Req, Res> {
  key: string

  get(url: string, requestInit?: Req): Res
  head(url: string, requestInit?: Req): Res
  delete(url: string, requestInit?: Req): Res

  post(url: string, body: any, requestInit?: Req): Res
  put(url: string, body: any, requestInit?: Req): Res
  patch(url: string, body: any, requestInit?: Req): Res

  request(fullRequestInit: Req & { url: string }): Res
}
