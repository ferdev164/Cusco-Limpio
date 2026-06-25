import { Controller, Get } from '@nestjs/common';
import { AyudantesService } from './ayudantes.service';

@Controller('api/ayudantes')
export class AyudantesController {
  constructor(private readonly ayudantesService: AyudantesService) {}

  @Get()
  findAll() {
    return this.ayudantesService.findAll();
  }
}
