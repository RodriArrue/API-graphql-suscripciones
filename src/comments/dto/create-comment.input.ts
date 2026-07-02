import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsNumber, MinLength } from 'class-validator';

@InputType({ description: 'Input para crear un nuevo comentario' })
export class CreateCommentInput {
  @Field({ description: 'Contenido del comentario' })
  @IsString()
  @IsNotEmpty({ message: 'El contenido del comentario es obligatorio' })
  @MinLength(1, { message: 'El comentario no puede estar vacío' })
  content: string;

  @Field(() => Int, {
    description: 'ID del post al que pertenece el comentario',
  })
  @IsNumber({}, { message: 'El postId debe ser un número' })
  postId: number;
}
