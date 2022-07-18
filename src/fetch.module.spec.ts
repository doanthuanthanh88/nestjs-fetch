import { Inject, Injectable } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { join } from 'path';
import { Simulator } from 'yaml-scene/src/Simulator';
import { TimeUtils } from 'yaml-scene/src/utils/TimeUtils';
import { FetchFactory, FetchModule } from '.';
import { FetchService } from './services/fetch/fetch.service';
import { NodeFetchService } from './services/node-fetch/node-fetch.service';

@Injectable()
class TestProvider {
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

describe('FetchModule', () => {
  let service: TestProvider;
  let begin: number
  const mockServerRunningTime = 3000

  beforeAll(async () => {
    Simulator.Run(`
      - yas-http/Server:
          host: 0.0.0.0
          port: 6001
          timeout: ${mockServerRunningTime}
          routers:
            - method: GET
              path: /books
              response:
                status: 200
                data: [
                  {    
                    "id": "ID 1",
                    "title": "book name 1",
                    "price": 1000
                  },
                  {    
                    "id": "ID 2",
                    "title": "book name 2",
                    "price": 2000
                  },
                  {    
                    "id": "ID 3",
                    "title": "book name 3",
                    "price": 3000
                  },
                  {    
                    "id": "ID 4",
                    "title": "book name 4",
                    "price": 4000
                  },
                  {    
                    "id": "ID 5",
                    "title": "book name 5",
                    "price": 5000
                  }    
                ]
    `)
    await TimeUtils.Delay(500)
    begin = Date.now()
  });

  afterAll(async () => {
    const remainTime = mockServerRunningTime - (Date.now() - begin)
    await TimeUtils.Delay((remainTime < 0 ? 0 : remainTime) + 200)
  }, 5000)

  beforeEach(async () => {
    // FetchModule.globalFetchClass = NodeFetchService
    FetchModule.globalOptions = {
      timeout: 1000
    }
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        FetchModule.registerAsync(
          {
            imports: [
              ConfigModule.forRoot({ envFilePath: join(__dirname, '../.env') }),
            ],
            useValue: {
              headers: {
                'x-source': 'test fetch module',
              }
            },
            extraProviders: [
              FetchFactory.createProvider('bookNodeFetch', {
                useFactory(configService: ConfigService) {
                  return {
                    baseURL: configService.getOrThrow<string>('BOOK_SERVICES_BASE_URL'),
                    headers: {
                      from: 'fetch in jest',
                      'x-api-key': configService.getOrThrow<string>('BOOK_SERVICES_API_KEY'),
                    }
                  }
                },
                inject: [ConfigService]
              }, NodeFetchService),
              FetchFactory.createProvider('bookFetch', {
                useFactory(configService: ConfigService) {
                  return {
                    baseURL: configService.getOrThrow<string>('BOOK_SERVICES_BASE_URL'),
                    headers: {
                      from: 'fetch in jest',
                      'x-api-key': configService.getOrThrow<string>('BOOK_SERVICES_API_KEY'),
                    }
                  }
                },
                inject: [ConfigService]
              }, FetchService),
              FetchFactory.createProvider('userFetch', {
                useValue: {
                  baseURL: 'http://localhost:6000',
                  headers: {
                    'x-api-key': 'user-api-key'
                  }
                }
              }, FetchService)
            ]
          }
        )
      ],
      providers: [
        TestProvider,
      ]
    }).compile();

    service = await module.resolve<TestProvider>(TestProvider);
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should pass raw-fetch', async () => {
    console.time('raw-fetch')
    await service.testRawFetch()
    // expect(books).toHaveLength(5)
    console.timeEnd('raw-fetch')
  })

  it('should pass node-fetch', async () => {
    console.time('node-fetch')
    await service.testNodeFetch()
    // expect(books).toHaveLength(5)
    console.timeEnd('node-fetch')
  })
});
