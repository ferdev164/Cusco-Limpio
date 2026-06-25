import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Conductor } from '../../usuarios/entities/conductor.entity';
import { Programacion } from './programacion.entity';
import { Zona } from './zona.entity';

export enum EstadoVehiculo {
  DISPONIBLE = 'disponible',
  EN_RUTA = 'en_ruta',
  MANTENIMIENTO = 'mantenimiento',
  FUERA_SERVICIO = 'fuera_servicio',
}

@Entity('vehiculos')
export class Vehiculo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  placa: string;

  @Column()
  tipo: string;

  @Column({ nullable: true })
  capacidad: string;

  @Column({ default: 0 })
  km: number;

  @Column({ default: EstadoVehiculo.DISPONIBLE })
  estado: EstadoVehiculo;

  @ManyToOne(() => Conductor, { eager: true, nullable: true })
  @JoinColumn({ name: 'conductor_id' })
  conductor?: Conductor;

  @ManyToOne(() => Zona, (zona) => zona.vehiculos, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'zona_id' })
  zona?: Zona;

  @OneToMany(() => Programacion, (programacion) => programacion.vehiculo)
  programaciones: Programacion[];
}
