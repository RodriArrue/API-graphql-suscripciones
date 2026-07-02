import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../comments/entities/comment.entity';

@ObjectType({ description: 'Entidad de usuario del sistema' })
@Entity('users')
export class User {
  @Field(() => Int, { description: 'ID único del usuario' })
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ description: 'Correo electrónico del usuario' })
  @Column({ unique: true })
  email: string;

  @Field({ description: 'Nombre de usuario único' })
  @Column({ unique: true })
  username: string;

  // El password NO se expone en GraphQL (sin @Field)
  @Column()
  password: string;

  @Field(() => [Post], {
    description: 'Posts creados por el usuario',
    nullable: true,
  })
  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @Field(() => [Comment], {
    description: 'Comentarios del usuario',
    nullable: true,
  })
  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @Field({ description: 'Fecha de creación del usuario' })
  @CreateDateColumn()
  createdAt: Date;
}
