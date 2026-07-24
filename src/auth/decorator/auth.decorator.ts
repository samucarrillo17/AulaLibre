import { applyDecorators, UseGuards } from '@nestjs/common';

import { RoleProtected } from './role-protected.decorator';
import { AuthGuard } from '@nestjs/passport';

import { ValidRoles } from '../interfaces/valid-roles.interface';
import { UserRoleGuard } from '../Guards/user-role.guard';

export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard(), UserRoleGuard),
  );
}
