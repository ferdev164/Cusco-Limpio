import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Conductor } from '../../usuarios/entities/conductor.entity';
import { Ayudante } from './ayudante.entity';
import { Horario } from './horario.entity';
import { Vehiculo } from './vehiculo.entity';

@Entity('programaciones')
export class Programacion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Horario, (horario) => horario.programaciones, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'horario_id' })
  horario: Horario;

  @ManyToOne(() => Conductor, { eager: true, nullable: true })
  @JoinColumn({ name: 'conductor_id' })
  conductor?: Conductor;

  @ManyToOne(() => Vehiculo, (vehiculo) => vehiculo.programaciones, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'vehiculo_id' })
  vehiculo?: Vehiculo;

  @ManyToMany(() => Ayudante, (ayudante) => ayudante.programaciones, {
    eager: true,
  })
  @JoinTable({
    name: 'programacion_ayudantes',
    joinColumn: { name: 'programacion_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'ayudante_id', referencedColumnName: 'id' },
  })
  ayudantes: Ayudante[];

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
