import { Comment } from 'src/comments/entities/comment.entity';
import { Faculty } from 'src/faculties/entities/faculty.entity';
import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  name!: string;


  @DeleteDateColumn({select: false})
  deletedAt!: Date;

  @OneToMany(() => Comment, (comment) => comment.course)
  comments!: Comment[];


  @ManyToOne(()=> Faculty, (faculty) => faculty.courses,{ onDelete: 'CASCADE',eager: true})
  @JoinColumn({ name: 'faculty_id' })
  faculty!: Faculty;
}
