import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El correo no es valido' })
  correo: string;

  @IsString()
  @MinLength(6, { message: 'La contrasena debe tener al menos 6 caracteres' })
  contrasena: string;
}
