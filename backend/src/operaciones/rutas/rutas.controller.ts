import { Controller, Get } from '@nestjs/common';
import { RutasService } from './rutas.service';

@Controller('api/rutas')
export class RutasController {
  constructor(private readonly rutasService: RutasService) {}

  @Get()
  findAll() {
    return this.rutasService.findAll();
  }
}
