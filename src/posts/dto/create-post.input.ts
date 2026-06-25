import { InputType, Field } from '@nestjs/graphql';
import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

@InputType({ description: 'Input para crear un nuevo post' })
export class CreatePostInput {
  @Field({ description: 'Título del post' })
  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  @MaxLength(200, { message: 'El título no puede tener más de 200 caracteres' })
  title: string;

  @Field({ description: 'Contenido del post' })
  @IsString()
  @IsNotEmpty({ message: 'El contenido es obligatorio' })
  @MinLength(10, { message: 'El contenido debe tener al menos 10 caracteres' })
  content: string;
}
