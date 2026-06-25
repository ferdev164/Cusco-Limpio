import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class AsignarVehiculoDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  programacionId?: number;
}
