import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';

@ObjectType({ description: 'Entidad de comentario en un post' })
@Entity('comments')
export class Comment {
  @Field(() => Int, { description: 'ID único del comentario' })
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ description: 'Contenido del comentario' })
  @Column('text')
  content: string;

  @Field(() => User, { description: 'Autor del comentario' })
  @ManyToOne(() => User, (user) => user.comments, { eager: false })
  author: User;

  @Column()
  authorId: number;

  @Field(() => Post, { description: 'Post al que pertenece el comentario' })
  @ManyToOne(() => Post, (post) => post.comments, { eager: false })
  post: Post;

  @Column()
  postId: number;

  @Field({ description: 'Fecha de creación del comentario' })
  @CreateDateColumn()
  createdAt: Date;
}
