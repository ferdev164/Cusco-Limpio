import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('administradores')
export class Administrador {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Usuario, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn()
  usuario: Usuario;

  @Column({ nullable: true })
  cargo: string;
}