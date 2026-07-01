import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CommentsService } from '../../src/comments/comments.service';
import { Comment } from '../../src/comments/entities/comment.entity';

describe('CommentsService', () => {
  let commentsService: CommentsService;
  let commentsRepository: Partial<Record<keyof Repository<Comment>, jest.Mock>>;

  beforeEach(async () => {
    commentsRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: getRepositoryToken(Comment), useValue: commentsRepository },
      ],
    }).compile();

    commentsService = module.get<CommentsService>(CommentsService);
  });

  describe('findByPostId', () => {
    it('debe retornar comentarios de un post ordenados por fecha ASC', async () => {
      const mockComments = [
        { id: 1, content: 'Primer comentario', postId: 1 },
        { id: 2, content: 'Segundo comentario', postId: 1 },
      ];
      commentsRepository.find!.mockResolvedValue(mockComments);

      const result = await commentsService.findByPostId(1);

      expect(result).toEqual(mockComments);
      expect(commentsRepository.find).toHaveBeenCalledWith({
        where: { postId: 1 },
        order: { createdAt: 'ASC' },
      });
    });

    it('debe retornar array vacío si no hay comentarios', async () => {
      commentsRepository.find!.mockResolvedValue([]);

      const result = await commentsService.findByPostId(999);

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('debe crear un comentario y retornarlo con relaciones', async () => {
      const createInput = { content: 'Buen post!', postId: 1 };
      const savedComment = { id: 1, ...createInput, authorId: 5 };
      const fullComment = {
        ...savedComment,
        author: { id: 5, username: 'testuser' },
        post: { id: 1, title: 'Post 1' },
      };

      commentsRepository.create!.mockReturnValue(savedComment);
      commentsRepository.save!.mockResolvedValue(savedComment);
      commentsRepository.findOne!.mockResolvedValue(fullComment);

      const result = await commentsService.create(createInput, 5);

      expect(result).toEqual(fullComment);
      expect(commentsRepository.create).toHaveBeenCalledWith({
        content: 'Buen post!',
        postId: 1,
        authorId: 5,
      });
      expect(commentsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { author: true, post: true },
      });
    });

    it('debe lanzar NotFoundException si falla la recarga del comentario', async () => {
      const createInput = { content: 'Comentario', postId: 1 };
      const savedComment = { id: 1, ...createInput, authorId: 5 };

      commentsRepository.create!.mockReturnValue(savedComment);
      commentsRepository.save!.mockResolvedValue(savedComment);
      commentsRepository.findOne!.mockResolvedValue(null);

      await expect(commentsService.create(createInput, 5)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
