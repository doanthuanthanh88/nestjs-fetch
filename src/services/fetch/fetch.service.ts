import * as merge from 'lodash.merge';
import { FetchError } from '../../fetch-error';
import { FetchUtils } from '../../fetch.utils';
import { Fetch } from '../fetch.interface';
import { Timeout } from '../timeout';
import { FetchOptions } from './fetch-options.interface';

export class FetchService implements Fetch<FetchOptions, Promise<Response>> {
  constructor(public key: string, private requestOptions: any) { }

  get(url: string, requestOptions?: FetchOptions) {
    return this.request({
      ...requestOptions,
      url,
      method: 'get',
    })
  }

  head(url: string, requestOptions?: FetchOptions) {
    return this.request({
      ...requestOptions,
      url,
      method: 'head',
    })
  }

  delete(url: string, requestOptions?: FetchOptions) {
    return this.request({
      ...requestOptions,
      url,
      method: 'delete',
    })
  }

  post(url: string, body: any, requestOptions?: FetchOptions) {
    return this.request({
      ...requestOptions,
      url,
      method: 'post',
      body,
    })
  }

  put(url: string, body: any, requestOptions?: FetchOptions) {
    return this.request({
      ...requestOptions,
      url,
      method: 'put',
      body,
    })
  }

  patch(url: string, body: any, requestOptions?: FetchOptions) {
    return this.request({
      ...requestOptions,
      url,
      method: 'patch',
      body,
    })
  }

  async request(requestOptions: FetchOptions) {
    const { url, baseURL = '', query, timeout, ...config } = merge({}, this.requestOptions, requestOptions)
    const fullURL = FetchUtils.getURL(baseURL, url, query)
    try {
      let resp: Response
      if (timeout) {
        const controller = new AbortController()
        const timeoutChecker = new Timeout(timeout, () => controller.abort())
        resp = await Promise.race([
          fetch(fullURL, { ...config, signal: controller.signal }),
          timeoutChecker.toPromise(),
        ]).finally(() => timeoutChecker.dispose())
      } else {
        resp = await fetch(fullURL, config)
      }
      if (!resp.ok) {
        throw new FetchError(`${resp.status}:${resp.statusText}`, {
          name: FetchError.name,
          url: fullURL,
          method: config.method,
          headers: config.headers as any,
          body: config.body,
          status: resp.status,
          statusText: resp.statusText,
          responseHeaders: resp.headers as any,
          response: await resp.text()
        })
      }
      return resp
    } catch (err) {
      throw new FetchError(err.message, {
        serviceName: this.key,
        status: 500,
        url: fullURL,
        method: config.method,
        headers: config.headers as any,
        body: config.body,
      })
    }
  }

}