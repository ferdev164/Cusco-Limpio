import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Horario } from './horario.entity';
import { Ruta } from './ruta.entity';
import { Vehiculo } from './vehiculo.entity';

@Entity('zonas')
export class Zona {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string;

  @OneToMany(() => Horario, (horario) => horario.zona)
  horarios: Horario[];

  @OneToMany(() => Ruta, (ruta) => ruta.zona)
  rutas: Ruta[];

  @OneToMany(() => Vehiculo, (vehiculo) => vehiculo.zona)
  vehiculos: Vehiculo[];
}
