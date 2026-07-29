import { IsString, IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CrearHorarioDto {
  @IsInt()
  @Type(() => Number)
  zonaId: number;

  @IsString()
  @IsNotEmpty({ message: 'El turno es obligatorio' })
  turno: string;

  @IsString()
  @IsNotEmpty({ message: 'La hora de inicio es obligatoria' })
  horaInicio: string; // formato "07:00"

  @IsString()
  @IsNotEmpty({ message: 'La hora de fin es obligatoria' })
  horaFin: string;

  @IsString()
  @IsNotEmpty({ message: 'Los días son obligatorios' })
  dias: string; // ej: "Lunes,Miércoles,Viernes"
}