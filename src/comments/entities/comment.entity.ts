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

  @Column('text')
  description!: string;

  @Column('text')
  authorHash!: string;

  @CreateDateColumn({select: false})
  createdAt!: Date;

  @ManyToOne(() => Course, (course) => course.comments)
  course!: Course;
}
