import { PartialType } from '@nestjs/mapped-types';
import { CrearGuiaDto } from './crear-guia.dto';

export class ActualizarGuiaDto extends PartialType(CrearGuiaDto) {}
