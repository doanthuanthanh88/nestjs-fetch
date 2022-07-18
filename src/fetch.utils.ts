import { stringify } from "querystring"

export class FetchUtils {
  static getURL(baseURL = '', url = '', query?: any) {
    const fullURL = `${baseURL}${url}`
    return !query ? fullURL : `${fullURL}?${stringify(query)}`
  }
}