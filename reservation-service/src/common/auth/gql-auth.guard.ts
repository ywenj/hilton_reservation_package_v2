import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import * as jwt from "jsonwebtoken";
import { JwtUser, UserRole } from "./roles";

interface GuardOptions {
  roles?: UserRole[];
}

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(private options: GuardOptions = {}) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const auth = req?.headers?.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) throw new UnauthorizedException("Missing token");
    try {
      const secret = process.env.JWT_SECRET || "dev-secret";
      const decoded = jwt.verify(token, secret) as JwtUser;
      // role check
      if (this.options.roles && !this.options.roles.includes(decoded.role)) {
        throw new ForbiddenException("Insufficient role");
      }
      ctx.getContext().user = decoded;
      return true;
    } catch (e) {
      if (e instanceof ForbiddenException) throw e;
      throw new UnauthorizedException("Invalid token");
    }
  }
}

export const RequireRoles = (...roles: UserRole[]) =>
  new GqlAuthGuard({ roles });
