import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { JwtUser } from "./roles";

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): JwtUser | null => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().user || null;
  }
);
