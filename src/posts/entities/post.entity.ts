import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';

@ObjectType({ description: 'Entidad de post/artículo del blog' })
@Entity('posts')
export class Post {
  @Field(() => Int, { description: 'ID único del post' })
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ description: 'Título del post' })
  @Column()
  title: string;

  @Field({ description: 'Contenido completo del post' })
  @Column('text')
  content: string;

  @Field(() => User, { description: 'Autor del post' })
  @ManyToOne(() => User, (user) => user.posts, { eager: false })
  author: User;

  @Column()
  authorId: number;

  @Field(() => [Comment], { description: 'Comentarios del post', nullable: true })
  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @Field({ description: 'Fecha de creación del post' })
  @CreateDateColumn()
  createdAt: Date;
}
