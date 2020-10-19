import { ExecutionContext, Injectable, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { AuthDTO } from '../dto';
import * as moment from 'moment';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

    constructor(
        private configService: ConfigService,
        @Inject('AuthService') private readonly authService: AuthService
    ) {
        super();
    }

    canActivate(context: ExecutionContext) {
        // Add your custom authentication logic here
        // for example, call super.logIn(request) to establish a session.
        // const request = context.switchToHttp().getRequest();

        const request = context.switchToHttp().getRequest();

        this.validateRequest(request);

        return super.canActivate(context);
    }

    validateRequest(request: Request): void {

        const headers = request.headers;

        if (headers.authorization) {
            const token: string = this.authService.extractJWT(headers.authorization);

            const payload: AuthDTO = this.authService.jwtService.decode(token) as AuthDTO;

            if (!payload) {
                throw new BadRequestException();
            }

            const currentDate = moment().unix();

            const isExpired = currentDate > payload.exp;

            if (isExpired) {

                const isAllowToRenewal = currentDate > payload.rnw;

                if (!isAllowToRenewal) {
                    throw new UnauthorizedException({
                        "statusCode": 401,
                        "type": "Expired Token",
                        "message": "Allow to Renewal"
                    });
                } {
                    throw new UnauthorizedException({
                        "statusCode": 401,
                        "type": "Unauthorized",
                        "message": "Invalid Token to Renewal"
                    });
                }
            }
        }
    }
}
