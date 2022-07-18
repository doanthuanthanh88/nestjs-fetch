import { ModuleMetadata, Type } from "@nestjs/common";
import * as merge from 'lodash.merge';
import { FETCH_MODULE_OPTIONS } from "./constants";
import { FetchModule } from "./fetch.module";
import { FetchOptions } from "./services/fetch/fetch-options.interface";
import { FetchService } from "./services/fetch/fetch.service";
import { NodeFetchOptions } from "./services/node-fetch/node-fetch-options.interface";
import { NodeFetchService } from "./services/node-fetch/node-fetch.service";

export interface FetchProviderOptions<T> extends Pick<ModuleMetadata, 'imports'> {
  useValue?: T
  useFactory?: (...args: any[]) => Promise<T> | T;
  inject?: any[];
}

export class FetchFactory {

  /**
   * Create a new fetch provider
   * @param name Inject token
   * @param fetchProviderOptions Fetch option
   * @param FetchType Class which used to implements to call others. Default is NodeFetchFetcher (node-fetch)
   * @returns Provider
   */
  static createProvider(name: string, fetchProviderOptions: FetchProviderOptions<FetchOptions>, FetchClass: Type<FetchService>)
  static createProvider(name: string, fetchProviderOptions: FetchProviderOptions<NodeFetchOptions>, FetchClass: Type<NodeFetchService>)
  static createProvider(name: string, fetchProviderOptions: FetchProviderOptions<any>, FetchClass = FetchModule.globalFetchClass) {
    const useFactory = fetchProviderOptions.useFactory ? async (fetchModuleOptions: any, ...args: any) => {
      const config = await fetchProviderOptions.useFactory(...args) || fetchProviderOptions.useValue
      return new FetchClass(name, merge({}, FetchModule.globalOptions, fetchModuleOptions, config))
    } : undefined
    return {
      provide: name,
      useValue: fetchProviderOptions.useValue,
      useFactory,
      inject: [FETCH_MODULE_OPTIONS, ...(fetchProviderOptions.inject || [])],
    }
  }
}
