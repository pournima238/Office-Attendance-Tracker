import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service.js';
import { User } from '../user/user.entity.js';


@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => User)
  async register(
    @Args('email') email: string,
    @Args('name') name: string,
    @Args('password') pass: string,
  ) {
    console.log("Resolver reached!");
    return this.authService.register(email, name, pass);
  }

  // Note: For login, you'll usually want a custom "AuthPayload" type 
  // that returns both the user and the access_token string.
}