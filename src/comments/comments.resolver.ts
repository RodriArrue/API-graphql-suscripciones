import {
  Resolver,
  Query,
  Mutation,
  Subscription,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { Comment } from './entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { Post } from '../posts/entities/post.entity';
import { CommentsService } from './comments.service';
import { UsersService } from '../users/users.service';
import { PostsService } from '../posts/posts.service';
import { CreateCommentInput } from './dto/create-comment.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PUB_SUB } from '../common/constants';

const COMMENT_ADDED = 'commentAdded';

@Resolver(() => Comment)
export class CommentsResolver {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Query(() => [Comment], {
    name: 'commentsByPost',
    description: 'Obtener todos los comentarios de un post específico',
  })
  async findByPost(
    @Args('postId', { type: () => Int, description: 'ID del post' })
    postId: number,
  ): Promise<Comment[]> {
    return this.commentsService.findByPostId(postId);
  }

  @Mutation(() => Comment, {
    description: 'Crear un nuevo comentario en un post',
  })
  @UseGuards(GqlAuthGuard)
  async createComment(
    @Args('createCommentInput') createCommentInput: CreateCommentInput,
    @CurrentUser() user: { userId: number; email: string },
  ): Promise<Comment> {
    const comment = await this.commentsService.create(
      createCommentInput,
      user.userId,
    );

    // Publicar evento para subscription
    await this.pubSub.publish(COMMENT_ADDED, { commentAdded: comment });

    return comment;
  }

  @Subscription(() => Comment, {
    description: 'Suscribirse a nuevos comentarios en un post específico',
    filter: (
      payload: { commentAdded: Comment },
      variables: { postId: number },
    ) => payload.commentAdded.postId === variables.postId,
    resolve: (payload: { commentAdded: Comment }) => payload.commentAdded,
  })
  /* eslint-disable @typescript-eslint/no-unused-vars */
  commentAdded(
    @Args('postId', { type: () => Int, description: 'ID del post a escuchar' })
    _postId: number,
  ) {
    /* eslint-enable @typescript-eslint/no-unused-vars */
    return this.pubSub.asyncIterableIterator(COMMENT_ADDED);
  }

  @ResolveField('author', () => User, { description: 'Autor del comentario' })
  async getAuthor(@Parent() comment: Comment): Promise<User | null> {
    return this.usersService.findOneById(comment.authorId);
  }

  @ResolveField('post', () => Post, { description: 'Post del comentario' })
  async getPost(@Parent() comment: Comment): Promise<Post> {
    return this.postsService.findOneById(comment.postId);
  }
}
