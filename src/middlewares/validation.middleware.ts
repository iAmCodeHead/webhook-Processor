import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { UnprocessableEntityError } from '@exceptions/HttpException';

export default class RequestValidator {

  public static validateArbitraryBody = () => {
    return async (req: Request, _res: Response, next: NextFunction) => {
      if(!req.body || Object.keys(req.body).length === 0) {
        next(new UnprocessableEntityError('Request validation failed', ['JSON can not be empty']));
      }
      next();
    };
  }

  public static validateBody = <T extends object>(classInstance: ClassConstructor<T>) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
      const convertedObject = plainToInstance(classInstance, req.body);
      await validate(convertedObject).then((errors) => {
        if (errors.length > 0) {
          let rawErrors: string[] = [];
          for (const errorItem of errors) {
            rawErrors = rawErrors.concat(...rawErrors, Object.values(errorItem.constraints ?? []));
          }
          const validationErrorText = "Request validation failed";
          next(new UnprocessableEntityError(`${validationErrorText}: ${rawErrors[0]}`, rawErrors));
        }
      });
      next();
    };
  };
}
