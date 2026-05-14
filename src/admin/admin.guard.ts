import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // --> Get the token from the headers
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'You must provide a valid token to access this.',
      );
    }

    const token = authHeader.split(' ')[1];

    try {
      // --> Read the token (Use the EXACT same secret key from app.module.ts) <-------
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'MY_SUPER_SECRET_KEY_123',
      });

      // --> Check if they are actually an admin!
      if (payload.role !== 'admin') {
        throw new UnauthorizedException(
          'Access Denied: Only Admins can do this!',
        );
      }

      return true; // Let them through!
    } catch {
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }
}
