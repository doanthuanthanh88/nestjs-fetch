# nestjs-fetch
Fetch module for nestJS which provide request to http(s) server

## Features
- Provide 2 choices  
  1. fetch (a new one in nodejs)
  2. [node-fetch](https://www.npmjs.com/package/node-fetch)

> Default is fetch. In case nodejs not support `fetch` then it auto replace to `node-fetch`

## Installation

```sh
  npm install @opensrc/nestjs-fetch
```

## Example

In `book.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { FetchFactory, FetchModule } from '@opensrc/nestjs-fetch';
import { NodeFetchService } from '@opensrc/nestjs-fetch/services/node-fetch/node-fetch.service';
import { FetchService } from '@opensrc/nestjs-fetch/services/fetch/fetch.service';
import { BookProvider } from './book.provider'

@Module({
  imports: [
    FetchModule.registerAsync(
      {
        useValue: {
          headers: {
            'x-source': 'my-app',
            'x-api-key': 'KEY_HERE',
          }
        },
        extraProviders: [
          // Use node-fetch
          FetchFactory.createProvider('bookNodeFetch', {
            useValue: {
              baseURL: 'http://localhost:6000',
              headers: {
                from: 'node-fetch in jest',
                'x-api-key': 'user-api-key'
              }
            }
          }, NodeFetchService)

          // Use default fetch in nodejs
          FetchFactory.createProvider('bookFetch', {
            useValue: {
              baseURL: 'http://localhost:6000',
              headers: {
                from: 'fetch in jest',
                'x-api-key': 'user-api-key'
              }
            }
          }, FetchService)
        ]
      }
    ),
    providers: [BookProvider]
  ],
})
export class BookModule {}
```

In `book.provider.ts`

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { FetchService } from '@opensrc/nestjs-fetch/services/fetch/fetch.service';
import { NodeFetchService } from '@opensrc/nestjs-fetch/services/node-fetch/node-fetch.service';

@Injectable()
class BookProvider {
  constructor(@Inject('bookNodeFetch') private bookNodeFetch: NodeFetchService, @Inject('bookFetch') private bookFetch: FetchService) {
  }

  async testNodeFetch() {
    const books = await Promise.all(['/books', '/books', '/books', '/books', '/books',].map(async p => {
      return (await this.bookNodeFetch.get('/books')).json()
    }))
    return books.flat(1)
  }

  async testRawFetch() {
    const books = await Promise.all(['/books', '/books', '/books', '/books', '/books',].map(async p => {
      return (await this.bookFetch.get('/books')).json()
    }))
    return books.flat(1)
  }
}
```
