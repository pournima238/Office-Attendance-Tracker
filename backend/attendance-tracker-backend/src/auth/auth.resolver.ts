import { Resolver, Mutation, Args, registerEnumType } from '@nestjs/graphql';
import { AuthService } from './auth.service.js';
import { User } from '../user/user.entity.js';
import { AuthPayload } from './auth-payload.entity.js';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => User)
  async register(
    @Args('email') email: string,
    @Args('name') name: string,
    @Args('password') pass: string,
  ) {
    return this.authService.register(email, name, pass);
  }


 @Mutation(() => AuthPayload)
  async login(
    @Args('email') email: string,
    @Args('password') pass: string,
  ) {
    return this.authService.login(email, pass);
  }
}