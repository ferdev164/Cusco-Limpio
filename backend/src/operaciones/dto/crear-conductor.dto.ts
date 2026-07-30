import { IsOptional, IsString, MinLength } from 'class-validator';

export class CrearConductorDto {
  @IsString()
  @MinLength(1)
  nombre: string;

  @IsOptional()
  @IsString()
  licencia?: string;

  @IsOptional()
  @IsString()
  turno?: string;
}
