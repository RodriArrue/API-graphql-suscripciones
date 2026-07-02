import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PostsService } from '../../src/posts/posts.service';
import { Post } from '../../src/posts/entities/post.entity';

describe('PostsService', () => {
  let postsService: PostsService;
  let postsRepository: Partial<Record<keyof Repository<Post>, jest.Mock>>;

  beforeEach(async () => {
    postsRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getRepositoryToken(Post), useValue: postsRepository },
      ],
    }).compile();

    postsService = module.get<PostsService>(PostsService);
  });

  describe('findAll', () => {
    it('debe retornar posts con paginación', async () => {
      const mockPosts = [
        { id: 1, title: 'Post 1', content: 'Contenido 1' },
        { id: 2, title: 'Post 2', content: 'Contenido 2' },
      ];
      postsRepository.find!.mockResolvedValue(mockPosts);

      const result = await postsService.findAll(10, 0);

      expect(result).toEqual(mockPosts);
      expect(postsRepository.find).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        order: { createdAt: 'DESC' },
      });
    });

    it('debe usar valores por defecto de paginación', async () => {
      postsRepository.find!.mockResolvedValue([]);

      await postsService.findAll();

      expect(postsRepository.find).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOneById', () => {
    it('debe retornar un post por ID', async () => {
      const mockPost = { id: 1, title: 'Post 1', authorId: 1 };
      postsRepository.findOne!.mockResolvedValue(mockPost);

      const result = await postsService.findOneById(1);

      expect(result).toEqual(mockPost);
    });

    it('debe lanzar NotFoundException si el post no existe', async () => {
      postsRepository.findOne!.mockResolvedValue(null);

      await expect(postsService.findOneById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('debe crear un post con el authorId del usuario', async () => {
      const createInput = {
        title: 'Nuevo post',
        content: 'Contenido del post nuevo',
      };
      const mockPost = { id: 1, ...createInput, authorId: 5 };

      postsRepository.create!.mockReturnValue(mockPost);
      postsRepository.save!.mockResolvedValue(mockPost);

      const result = await postsService.create(createInput, 5);

      expect(result).toEqual(mockPost);
      expect(postsRepository.create).toHaveBeenCalledWith({
        ...createInput,
        authorId: 5,
      });
    });
  });

  describe('update', () => {
    it('debe actualizar un post si el usuario es el autor', async () => {
      const existingPost = {
        id: 1,
        title: 'Original',
        content: 'Contenido',
        authorId: 5,
      };
      const updateInput = { title: 'Actualizado' };

      postsRepository.findOne!.mockResolvedValue({ ...existingPost });
      postsRepository.save!.mockResolvedValue({
        ...existingPost,
        ...updateInput,
      });

      const result = await postsService.update(1, updateInput, 5);

      expect(result.title).toBe('Actualizado');
    });

    it('debe lanzar UnauthorizedException si el usuario no es el autor', async () => {
      postsRepository.findOne!.mockResolvedValue({
        id: 1,
        title: 'Post',
        authorId: 5,
      });

      await expect(
        postsService.update(1, { title: 'Hack' }, 999),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('remove', () => {
    it('debe eliminar un post si el usuario es el autor', async () => {
      const mockPost = { id: 1, title: 'Post', authorId: 5 };
      postsRepository.findOne!.mockResolvedValue(mockPost);
      postsRepository.remove!.mockResolvedValue(mockPost);

      const result = await postsService.remove(1, 5);

      expect(result).toEqual(mockPost);
      expect(postsRepository.remove).toHaveBeenCalledWith(mockPost);
    });

    it('debe lanzar UnauthorizedException si el usuario no es el autor', async () => {
      postsRepository.findOne!.mockResolvedValue({
        id: 1,
        title: 'Post',
        authorId: 5,
      });

      await expect(postsService.remove(1, 999)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
