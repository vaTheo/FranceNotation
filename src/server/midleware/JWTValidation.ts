import { Injectable, NestMiddleware } from '@nestjs/common';
import { TokenService } from '@server/service/token.service';
import { UserService } from '@server/service/user.service';
import { Request, Response, NextFunction } from 'express';

// Extend request interface to pass the user informations
export interface RequestExtendsJWT extends Request {
  user?: {
    userId: number;
    role: string;
  };
}


@Injectable()
export class JWTValidation implements NestMiddleware {
  constructor(
    private tokenService: TokenService,
    private user: UserService,
  ) {}
  //manage JWT so for each call with the server the JWT is validate and renew if needed
  async use(req: RequestExtendsJWT, res: Response, next: NextFunction) {
    // Extract the Authorization header
    const authirizationString = await req.cookies['authorization'];

    if (!authirizationString) {
      console.log('No Auth header in JWTValidation midleware');
    } else {
      // Split the Authorization header into 'Bearer' and the token
      const parts = authirizationString.split(' ');

      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).send({ message: 'Invalid authorization header format' });
      }
      const JWT = parts[1];
      const payload = this.tokenService.verifyJWT(JWT);
      if (!payload) {
        return res.status(401).send({ message: 'JWT expired or invalid' }); // Unauthorized response for failed JWT verification
      }
      // Add payload to req for future usage
      req.user = {
        userId: payload.userId,
        role: payload.role,
      };
      const signedJWT = this.tokenService.createJWT(payload.userId, payload.role);
      res.cookie('authorization', `Bearer ${signedJWT}`, {
        httpOnly: true,
        expires: new Date(Date.now() + 3600000), // Expires in 1 hour
      });
    }
    next();
  }
}
