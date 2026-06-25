import { Module } from '@nestjs/common';
import { AyudantesModule } from './ayudantes/ayudantes.module';
import { ConductoresModule } from './conductores/conductores.module';
import { HorariosModule } from './horarios/horarios.module';
import { ProgramacionesModule } from './programaciones/programaciones.module';
import { RutasModule } from './rutas/rutas.module';
import { VehiculosModule } from './vehiculos/vehiculos.module';
import { ZonasModule } from './zonas/zonas.module';

@Module({
  imports: [
    ZonasModule,
    HorariosModule,
    ConductoresModule,
    AyudantesModule,
    VehiculosModule,
    ProgramacionesModule,
    RutasModule,
  ],
})
export class OperacionesModule {}
