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

  @OneToOne(() => Usuario, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn()
  usuario: Usuario;

  @Column({ nullable: true })
  licencia: string;

  @Column({ nullable: true })
  turno: string;
}