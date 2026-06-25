import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('conductores')
export class Conductor {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Usuario, {
    eager: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario?: Usuario;

  @Column()
  nombre: string;

  @Column({ default: true })
  disponible: boolean;

  @Column({ default: true })
  activo: boolean;

  @Column({ nullable: true })
  licencia: string;

  @Column({ nullable: true })
  turno: string;
}
