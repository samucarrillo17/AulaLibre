import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  name!: string;

  @Column('text')
  lastName!: string;

  @Column('text', { unique: true })
  email!: string;

  @Column('text', { select: false })
  password!: string;

  @Column({
    type: 'enum',
    enum: ValidRoles,
    default: ValidRoles.STUDENT,
  })
  role!: ValidRoles;

  @Column('boolean', { default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;


  @BeforeInsert()
  LOWERCASE_EMAIL() {
    this.email = this.email.toLowerCase();
  }
}
