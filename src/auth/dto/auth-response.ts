import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType({ description: 'Respuesta de autenticación con token JWT' })
export class AuthResponse {
  @Field({ description: 'Token de acceso JWT' })
  accessToken: string;
}
