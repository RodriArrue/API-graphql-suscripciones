import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentInput } from './dto/create-comment.input';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  async findByPostId(postId: number): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { postId },
      order: { createdAt: 'ASC' },
    });
  }

  async create(
    createCommentInput: CreateCommentInput,
    userId: number,
  ): Promise<Comment> {
    const comment = this.commentsRepository.create({
      ...createCommentInput,
      authorId: userId,
    });

    const savedComment = await this.commentsRepository.save(comment);

    // Recargamos con relaciones para el subscription
    const fullComment = await this.commentsRepository.findOne({
      where: { id: savedComment.id },
      relations: { author: true, post: true },
    });

    if (!fullComment) {
      throw new NotFoundException('Error al crear el comentario');
    }

    return fullComment;
  }
}
