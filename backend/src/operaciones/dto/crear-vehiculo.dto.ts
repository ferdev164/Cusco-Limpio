import { IsString, IsOptional, IsInt, IsEnum, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoVehiculo } from '../entities/vehiculo.entity';

export class CrearVehiculoDto {
  @IsString()
  @IsNotEmpty({ message: 'La placa es obligatoria' })
  placa: string;

  @IsString()
  @IsNotEmpty({ message: 'El tipo es obligatorio' })
  tipo: string;

  @IsOptional()
  @IsString()
  capacidad?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  km?: number;

  @IsOptional()
  @IsEnum(EstadoVehiculo, { message: 'Estado no válido' })
  estado?: EstadoVehiculo;
}