import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class IniciarRecojoDto {
  @IsInt()
  @Type(() => Number)
  programacionId: number;
}
