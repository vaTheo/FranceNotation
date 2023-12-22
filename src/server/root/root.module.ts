import { MiddlewareConsumer, Module, Req } from '@nestjs/common';
import { DataRatingModule } from '../datarating-module/dataRatings.module';
import { UserModule } from '../user-module/user.module';
import { AsUUID } from '@server/midleware/asUUID';
import { UsersController } from '@server/users/users.controller';
import { JWTValidation } from '@server/midleware/JWTValidation';
import { TokenService } from '@server/service/token.service';
import { UserService } from '@server/service/user.service';
import { PrismaService } from '@server/service/prisma.service';
import { NextFunction, Request, Response } from 'express';


@Module({
  imports: [UserModule, DataRatingModule],
  controllers: [],
  providers: [TokenService, UserService, PrismaService], //Service and midlware
})
export class RootModule {
  constructor(
    private tokenService: TokenService,
    private userService: UserService,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(//As nest can't inject services in midlware automaticaly, do it like this 
        (req: Request, res: Response, next:NextFunction) => 
          new AsUUID(this.tokenService, this.userService).use(req, res, next),
        (req: Request, res: Response, next: NextFunction) =>
          new JWTValidation(this.tokenService, this.userService).use(req, res, next),
      )
      .forRoutes('*');
  }
}
