import { IsNotEmptyObject, IsObject } from 'class-validator';

export class WebhookDto {
  @IsObject()
  @IsNotEmptyObject()
  payload: Record<string, unknown> | undefined;
}
