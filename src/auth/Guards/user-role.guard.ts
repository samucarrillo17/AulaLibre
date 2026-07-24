import { Reflector } from '@nestjs/core';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { META_ROLES } from '../decorator/role-protected.decorator';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles = this.reflector.get<string[]>(
      META_ROLES,
      context.getHandler(),
    );

    if (!validRoles || validRoles.length === 0) {
      return true; //si no hay roles validos, entonces se permite el acceso a la ruta, es decir, no se hace ninguna validacion de roles
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user as User;
    console.log({usuario: user})

    const isAuthorized =validRoles.includes(user.role);

    if (!isAuthorized) {
      throw new ForbiddenException(`User ${user.name} need a valid role`);
    }

    return true;
  }
}
