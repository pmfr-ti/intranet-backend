import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/*
** Returns user from decoded token
*/

export const User = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);