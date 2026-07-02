import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../../src/users/users.service';
import { User } from '../../src/users/entities/user.entity';

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: Partial<Record<keyof Repository<User>, jest.Mock>>;

  beforeEach(async () => {
    usersRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: usersRepository },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  describe('findAll', () => {
    it('debe retornar un array de usuarios', async () => {
      const mockUsers = [
        { id: 1, email: 'user1@test.com', username: 'user1' },
        { id: 2, email: 'user2@test.com', username: 'user2' },
      ];
      usersRepository.find!.mockResolvedValue(mockUsers);

      const result = await usersService.findAll();

      expect(result).toEqual(mockUsers);
      expect(usersRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOneById', () => {
    it('debe retornar un usuario por ID', async () => {
      const mockUser = { id: 1, email: 'test@test.com', username: 'testuser' };
      usersRepository.findOne!.mockResolvedValue(mockUser);

      const result = await usersService.findOneById(1);

      expect(result).toEqual(mockUser);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('debe retornar null si el usuario no existe', async () => {
      usersRepository.findOne!.mockResolvedValue(null);

      const result = await usersService.findOneById(999);

      expect(result).toBeNull();
    });
  });

  describe('findOneByEmail', () => {
    it('debe retornar un usuario por email', async () => {
      const mockUser = { id: 1, email: 'test@test.com', username: 'testuser' };
      usersRepository.findOne!.mockResolvedValue(mockUser);

      const result = await usersService.findOneByEmail('test@test.com');

      expect(result).toEqual(mockUser);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
    });
  });

  describe('findByIds', () => {
    it('debe retornar usuarios por array de IDs', async () => {
      const mockUsers = [
        { id: 1, email: 'user1@test.com' },
        { id: 3, email: 'user3@test.com' },
      ];
      usersRepository.find!.mockResolvedValue(mockUsers);

      const result = await usersService.findByIds([1, 3]);

      expect(result).toEqual(mockUsers);
      expect(usersRepository.find).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('debe crear y guardar un usuario', async () => {
      const userData = {
        email: 'new@test.com',
        username: 'newuser',
        password: 'hashed',
      };
      const mockUser = { id: 1, ...userData };

      usersRepository.create!.mockReturnValue(mockUser);
      usersRepository.save!.mockResolvedValue(mockUser);

      const result = await usersService.create(userData);

      expect(result).toEqual(mockUser);
      expect(usersRepository.create).toHaveBeenCalledWith(userData);
      expect(usersRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });
});
