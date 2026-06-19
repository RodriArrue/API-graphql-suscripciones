import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength } from 'class-validator';

@InputType({ description: 'Input para iniciar sesión' })
export class LoginInput {
  @Field({ description: 'Correo electrónico del usuario' })
  @IsEmail({}, { message: 'El email debe ser un correo electrónico válido' })
  email: string;

  @Field({ description: 'Contraseña del usuario' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
