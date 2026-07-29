import { IsString, IsOptional, IsInt, IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CrearRutaDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  zonaId?: number;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  distanciaKm?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  tiempoEstimadoMin?: number;
}