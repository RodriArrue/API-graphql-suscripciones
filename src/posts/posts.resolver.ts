import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Post } from './entities/post.entity';
import { User } from '../users/entities/user.entity';
import { PostsService } from './posts.service';
import { UsersLoader } from './loaders/users.loader';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => Post)
export class PostsResolver {
  constructor(
    private readonly postsService: PostsService,
    private readonly usersLoader: UsersLoader,
  ) {}

  @Query(() => [Post], {
    name: 'posts',
    description: 'Listar posts con paginación',
  })
  async findAll(
    @Args('limit', {
      type: () => Int,
      defaultValue: 10,
      description: 'Cantidad de posts a retornar',
    })
    limit: number,
    @Args('offset', {
      type: () => Int,
      defaultValue: 0,
      description: 'Cantidad de posts a saltar',
    })
    offset: number,
  ): Promise<Post[]> {
    return this.postsService.findAll(limit, offset);
  }

  @Query(() => Post, { name: 'post', description: 'Obtener un post por ID' })
  async findOne(@Args('id', { type: () => ID }) id: number): Promise<Post> {
    return this.postsService.findOneById(id);
  }

  @Mutation(() => Post, { description: 'Crear un nuevo post' })
  @UseGuards(GqlAuthGuard)
  async createPost(
    @Args('createPostInput') createPostInput: CreatePostInput,
    @CurrentUser() user: { userId: number; email: string },
  ): Promise<Post> {
    return this.postsService.create(createPostInput, user.userId);
  }

  @Mutation(() => Post, { description: 'Actualizar un post existente' })
  @UseGuards(GqlAuthGuard)
  async updatePost(
    @Args('id', { type: () => ID }) id: number,
    @Args('updatePostInput') updatePostInput: UpdatePostInput,
    @CurrentUser() user: { userId: number; email: string },
  ): Promise<Post> {
    return this.postsService.update(id, updatePostInput, user.userId);
  }

  @Mutation(() => Post, { description: 'Eliminar un post' })
  @UseGuards(GqlAuthGuard)
  async removePost(
    @Args('id', { type: () => ID }) id: number,
    @CurrentUser() user: { userId: number; email: string },
  ): Promise<Post> {
    return this.postsService.remove(id, user.userId);
  }

  @ResolveField('author', () => User, {
    description: 'Autor del post (cargado con DataLoader)',
  })
  async getAuthor(@Parent() post: Post): Promise<User> {
    return this.usersLoader.load(post.authorId);
  }
}
