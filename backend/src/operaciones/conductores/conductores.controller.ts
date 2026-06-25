import { Controller, Get } from '@nestjs/common';
import { ConductoresService } from './conductores.service';

@Controller('api/conductores')
export class ConductoresController {
  constructor(private readonly conductoresService: ConductoresService) {}

  @Get()
  findAll() {
    return this.conductoresService.findAll();
  }
}
