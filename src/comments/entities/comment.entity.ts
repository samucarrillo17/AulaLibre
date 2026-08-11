import { Course } from 'src/courses/entities/course.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;


  @Column({ name: 'professor_name', type: 'varchar', length: 150 })
  professorName!: string;

  @Column({ type: 'int', default: 5 })
  rating!: number; 

  @Column({ type: 'text', nullable: true })
  reason!: string; 

  @Column('text')
  authorHash!: string;

  @CreateDateColumn({ select: false })
  createdAt!: Date;

  @ManyToOne(() => Course, (course) => course.comments)
  course!: Course;
}
