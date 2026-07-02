import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';

@Injectable({ scope: Scope.REQUEST })
export class UsersLoader {
  private readonly loader: DataLoader<number, User>;

  constructor(private readonly usersService: UsersService) {
    this.loader = new DataLoader<number, User>(
      async (ids: readonly number[]) => {
        const users = await this.usersService.findByIds([...ids]);
        const usersMap = new Map(users.map((user) => [user.id, user]));
        return ids.map((id) => usersMap.get(id) || new User());
      },
    );
  }

  async load(id: number): Promise<User> {
    return this.loader.load(id);
  }
}
