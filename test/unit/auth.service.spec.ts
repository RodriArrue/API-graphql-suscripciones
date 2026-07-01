import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;

  beforeEach(async () => {
    usersService = {
      findOneByEmail: jest.fn(),
      create: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('debe crear un usuario con password hasheado y retornar accessToken', async () => {
      const registerInput = {
        email: 'test@test.com',
        username: 'testuser',
        password: 'password123',
      };

      usersService.create!.mockResolvedValue({
        id: 1,
        email: registerInput.email,
        username: registerInput.username,
      });

      const result = await authService.register(registerInput);

      expect(result).toEqual({ accessToken: 'mock-jwt-token' });
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerInput.email,
          username: registerInput.username,
        }),
      );
      // Verificar que el password fue hasheado (no es el original)
      const callArg = usersService.create!.mock.calls[0][0];
      expect(callArg.password).not.toBe(registerInput.password);
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 1, email: 'test@test.com' });
    });
  });

  describe('login', () => {
    it('debe retornar accessToken con credenciales válidas', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      usersService.findOneByEmail!.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        password: hashedPassword,
      });

      const result = await authService.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result).toEqual({ accessToken: 'mock-jwt-token' });
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 1, email: 'test@test.com' });
    });

    it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
      usersService.findOneByEmail!.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'noexiste@test.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si el password es incorrecto', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      usersService.findOneByEmail!.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        password: hashedPassword,
      });

      await expect(
        authService.login({ email: 'test@test.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
