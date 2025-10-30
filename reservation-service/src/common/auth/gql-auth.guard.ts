import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { JwtUser, UserRole } from "./roles";

interface GuardOptions {
  roles?: UserRole[];
}

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(private options: GuardOptions = {}) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().user as JwtUser | undefined;
    if (!user) throw new UnauthorizedException("Unauthenticated");
    if (this.options.roles && !this.options.roles.includes(user.role)) {
      throw new ForbiddenException("Insufficient role");
    }
    return true;
  }
}

export const RequireRoles = (...roles: UserRole[]) =>
  new GqlAuthGuard({ roles });
