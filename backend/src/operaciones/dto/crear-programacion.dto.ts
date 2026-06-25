import { IsArray, IsInt, IsOptional, Max, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';

export class CrearProgramacionDto {
  @IsInt()
  @Type(() => Number)
  horarioId: number;

  @IsInt()
  @Type(() => Number)
  conductorId: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(2, { message: 'Maximo 2 ayudantes' })
  @IsInt({ each: true })
  @Max(2147483647, { each: true })
  @Type(() => Number)
  ayudanteIds?: number[];
}
