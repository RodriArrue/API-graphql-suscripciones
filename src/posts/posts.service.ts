import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async findAll(limit = 10, offset = 0): Promise<Post[]> {
    return this.postsRepository.find({
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });
  }

  async findOneById(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post con ID ${id} no encontrado`);
    }
    return post;
  }

  async create(createPostInput: CreatePostInput, userId: number): Promise<Post> {
    const post = this.postsRepository.create({
      ...createPostInput,
      authorId: userId,
    });
    return this.postsRepository.save(post);
  }

  async update(
    id: number,
    updatePostInput: UpdatePostInput,
    userId: number,
  ): Promise<Post> {
    const post = await this.findOneById(id);

    if (post.authorId !== userId) {
      throw new UnauthorizedException('No tenés permisos para editar este post');
    }

    Object.assign(post, updatePostInput);
    return this.postsRepository.save(post);
  }

  async remove(id: number, userId: number): Promise<Post> {
    const post = await this.findOneById(id);

    if (post.authorId !== userId) {
      throw new UnauthorizedException(
        'No tenés permisos para eliminar este post',
      );
    }

    return this.postsRepository.remove(post);
  }
}
