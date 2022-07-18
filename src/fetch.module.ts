import { DynamicModule, Module, ModuleMetadata, Provider, Type } from '@nestjs/common';
import * as merge from 'lodash.merge';
import { DEFAULT_TIMEOUT, FETCH_MODULE_OPTIONS } from './constants';
import { Fetch } from './services/fetch.interface';

export type FetchModuleOptions = {
  timeout?: number
  baseURL?: string;
  /** A default query string */
  query?: object;
  /** A string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL. Sets request's credentials. */
  credentials?: RequestCredentials;
  /** A Headers object, an object literal, or an array of two-item arrays to set request's headers. */
  headers?: HeadersInit;
  /** A boolean to set request's keepalive. */
  keepalive?: boolean;
  /** A string indicating whether request follows redirects, results in an error upon encountering a redirect, or returns the redirect (in an opaque fashion). Sets request's redirect. */
  redirect?: RequestRedirect;
}
export interface FetchModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useValue?: FetchModuleOptions
  useFactory?: (...args: any[]) => Promise<FetchModuleOptions> | FetchModuleOptions;
  inject?: any[];
  extraProviders?: Provider[];
}

@Module({})
export class FetchModule {
  /**
   * Default fetch options in global 
   * */
  static globalOptions: FetchModuleOptions = {
    timeout: DEFAULT_TIMEOUT
  }

  private static _globalFetchClass: Type<Fetch<any, any>>

  static set globalFetchClass(clazz: Type<Fetch<any, any>>) {
    this._globalFetchClass = clazz
  }

  static get globalFetchClass() {
    if (this._globalFetchClass) return this._globalFetchClass
    try {
      const { Fetch } = require('./fetcher/impl/fetch')
      return this._globalFetchClass = Fetch
    } catch { }
    try {
      const { NodeFetch } = require('./fetcher/impl/node-fetch')
      return this._globalFetchClass = NodeFetch
    } catch {
      throw new Error(`Need install "node-fetch" before use NodeFetch`)
    }
  }

  /**
   * Register fetch options in the module
   * @param fetchModuleOptions Default fetch options in the module
   * @returns 
   */
  static register(fetchModuleOptions: FetchModuleOptions): DynamicModule {
    return {
      module: FetchModule,
      providers: [
        {
          provide: FETCH_MODULE_OPTIONS,
          useValue: fetchModuleOptions
        },
      ],
      exports: [FETCH_MODULE_OPTIONS],
    }
  }

  /**
   * Register fetch options in the module
   * @param fetchModuleOptions Default fetch options in the module
   * @returns 
   */
  static registerAsync(fetchModuleAsyncOptions: FetchModuleAsyncOptions): DynamicModule {
    const { imports = [], extraProviders = [], ...providerProps } = fetchModuleAsyncOptions || {}
    return {
      module: FetchModule,
      imports: imports || [],
      providers: [
        {
          provide: FETCH_MODULE_OPTIONS,
          ...(merge({}, this.globalOptions, providerProps) as any)
        },
        ...extraProviders,
      ],
      exports: [FETCH_MODULE_OPTIONS, ...extraProviders],
    }
  }
}
