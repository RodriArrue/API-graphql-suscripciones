import { InputType, Field } from '@nestjs/graphql';
import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

@InputType({ description: 'Input para actualizar un post existente' })
export class UpdatePostInput {
  @Field(() => String, { description: 'Nuevo título del post', nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  @MaxLength(200, { message: 'El título no puede tener más de 200 caracteres' })
  title?: string;

  @Field(() => String, {
    description: 'Nuevo contenido del post',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'El contenido debe tener al menos 10 caracteres' })
  content?: string;
}
