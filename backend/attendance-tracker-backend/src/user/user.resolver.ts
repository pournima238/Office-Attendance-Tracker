import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';

import passport from 'passport';
import { User } from './user.entity.js';
import { UserService } from './user.service.js';

@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => [User])
  users() {
    return this.userService.findAll();
  }

  @Mutation(() => User)
  createUser(
    @Args('email') email: string,
    @Args('name') name: string,
    @Args('password') password :string,
  ) {
    return this.userService.createUser(email, name,password);
  }
}
