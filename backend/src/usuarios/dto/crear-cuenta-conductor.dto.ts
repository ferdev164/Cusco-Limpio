import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CrearCuentaConductorDto {
  @IsEmail({}, { message: 'El correo no es valido' })
  correo: string;

  @IsString()
  @MinLength(6, { message: 'La contrasena debe tener al menos 6 caracteres' })
  contrasena: string;

  @IsOptional()
  @IsString()
  telefono?: string;
}
