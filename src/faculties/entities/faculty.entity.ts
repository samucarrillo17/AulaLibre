import { Course } from "src/courses/entities/course.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('faculties')
export class Faculty {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  name!: string;

  @CreateDateColumn({ select: false })
  createdAt!: Date;

  @DeleteDateColumn({ select: false })
  deletedAt!: Date;

  @OneToMany(() => Course, (course) => course.faculty)
  courses!: Course[];
}
