declare module 'hestiaa' {
  import { NextFunction, Request, Response } from 'express'
  import { RequestHandler, RequestHandlerParams } from 'express-serve-static-core'
  import { Model, ModelClass, ObjectId, Plugin } from 'mongorito'
  import { CoreOptions, Request as RequestRequest, RequestAPI, RequiredUriUrl } from 'request'
  import * as winston from 'winston'

  export namespace logging {
    export const logger: (context?: string) => winston.Logger
  }

  export namespace errors {
    export class ForbiddenError {
      constructor(message?: string)
    }

    export class ResourceNotFoundError {
      constructor(messages: string | string[], fileName?: any, lineNumber?: any)
    }

    export class ValidationError {
      constructor(messages: string | string[], fileName?: any, lineNumber?: any)
    }
  }

  export namespace http {
    export function catchError(fn: (req: Request, res: Response, next: NextFunction) => void): (req: Request, res: Response, next: NextFunction) => void

    export class HttpResponseBuilder {
      static buildResponse<T = any>(fn: (req: Request) => T | Promise<T>): (req: Request, res: Response, next: NextFunction) => void
    }

    export namespace paginator {
      export function findPaginated<T extends ModelClass>(model: T, requestQuery: { offset: number; count: number }, query: any): PaginatedResult<T>
    }

    export class PaginatedResult<T> {
      constructor(items: Array<T>, currentPage: number, totalPages: number)
    }
  }

  export namespace middleware {
    export class LoggingHandler {
      static getHandler(): RequestHandlerParams

      static getErrorHandler(): RequestHandlerParams
    }

    export class UserTokenMiddleware {
      static publicRoutes(): Array<{ method: string; urlPattern: string | RegExp }>

      static getHandler(): RequestHandlerParams

      static hasRole(roles: string[]): RequestHandler
    }
  }

  export namespace model {
    export abstract class BaseValidator {
      static /*abstract*/ validations(): object

      static /*abstract*/ sanitizations(): object

      static sanitize(attributes: any): Promise<any>

      static getErrors(attributes: any): Promise<string[]>
    }

    export abstract class Entity extends Model {
      abstract __getValidator(): any // BaseValidator

      sanitize(): Promise<void>

      isValid(): Promise<boolean>

      _encapsulateErrors(errors: string[]): boolean

      unembed(collectionName: string, value: Model): Promise<boolean>

      embed(collectionName: string, value: Model): Promise<Model>

      getEmbeded(collectionName: string, _id?: string | ObjectId): Model

      massAssign(obj: object): void

      __readOnlyProps(): string[]

      clear(): void
    }
  }

  export namespace amqp {
    export class AMQPProducer {
      constructor(brokerUrl: string)

      connect(): Promise<void>

      close(): Promise<void>

      sendMessage(message: any, exchangeName: string, channelName: string, topic: string): Promise<void>
    }

    export class AMQPConsumer {
      constructor(brokerUrl: string)

      connect(): Promise<void>

      close(): Promise<void>

      addConsumeHandler(exchangeName: string, channelName: string, topic: string, messageHandler: (message: string) => Promise<any>): Promise<void>
    }
  }

  export namespace test {
    export const apiRequest: RequestAPI<RequestRequest, CoreOptions, RequiredUriUrl>
  }

  export namespace utils {
    interface CircuitBreakerOptions {
      /**
       * Number of calls to retry. (default: 3)
       */
      attemptsCount?: number

      /**
       * Time to wait between 2 attempts. In milliseconds. (default: 200)
       */
      sleepTime?: number

      /**
       * Number of attempts before deactivation. (default: 6)
       */
      deactivateAfter?: number

      /**
       * Time to wait before reactivation. In milliseconds. (default: 30000)
       */
      reactivateAfter?: number

      /**
       * Identifier used to identity target HTTP resource. To use when `requestOptions.url` is complex (with path or query parameters).
       */
      serviceId?: number
    }

    export namespace circuitBreaker {
      export function request(options: RequiredUriUrl & CoreOptions, cbOpts?: CircuitBreakerOptions): any
    }

    export namespace currentUser {
      export const middleware: RequestHandlerParams

      export function getValue(): string
    }

    export namespace mongoritoUtils {
      export const traceabilityFieldNames: string[]

      export const traceabilityPlugin: Plugin
    }

    export namespace cryptographer {
      export function encrypt(input: string, key?: string): Promise<string>

      export function decrypt(input: string, key?: string): Promise<string>

      export function hash(input: string): Promise<string>

      export function matchWithHash(input: string, hash: string): Promise<boolean>

      export function bcrypt(input: string): Promise<string>

      export function matchWithBcrypt(input: string, hash: string): Promise<boolean>
    }
  }
}
