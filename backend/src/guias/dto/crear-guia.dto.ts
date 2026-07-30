import { IsEnum, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';
import { CategoriaGuia } from '../entities/guia.entity';

export class CrearGuiaDto {
  @IsString()
  @MinLength(1)
  titulo: string;

  @IsEnum(CategoriaGuia)
  categoria: CategoriaGuia;

  @IsString()
  @MinLength(1)
  descripcion: string;

  @IsOptional()
  @IsUrl()
  imagenUrl?: string;
}
