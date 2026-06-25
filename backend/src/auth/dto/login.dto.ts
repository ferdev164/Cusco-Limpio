import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Rol } from '../../usuarios/entities/usuario.entity';

export class LoginDto {
  @IsEmail({}, { message: 'El correo no es valido' })
  correo: string;

  @IsString()
  @MinLength(6, { message: 'La contrasena debe tener al menos 6 caracteres' })
  contrasena: string;

  @IsEnum(Rol, { message: 'El rol seleccionado no es valido' })
  rol: Rol;
}
