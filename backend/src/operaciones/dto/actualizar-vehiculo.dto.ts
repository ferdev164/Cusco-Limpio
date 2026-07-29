import { PartialType } from '@nestjs/mapped-types';
import { CrearVehiculoDto } from './crear-vehiculo.dto';

// PartialType hace que todos los campos sean opcionales al editar
export class ActualizarVehiculoDto extends PartialType(CrearVehiculoDto) {}