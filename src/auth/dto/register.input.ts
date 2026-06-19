import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

@InputType({ description: 'Input para registrar un nuevo usuario' })
export class RegisterInput {
  @Field({ description: 'Correo electrónico del usuario' })
  @IsEmail({}, { message: 'El email debe ser un correo electrónico válido' })
  email: string;

  @Field({ description: 'Nombre de usuario único' })
  @IsString()
  @MinLength(3, { message: 'El username debe tener al menos 3 caracteres' })
  @MaxLength(20, { message: 'El username no puede tener más de 20 caracteres' })
  username: string;

  @Field({ description: 'Contraseña del usuario' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
