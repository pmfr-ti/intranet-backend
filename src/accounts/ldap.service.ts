import { HttpService, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { Observable, pipe } from 'rxjs';
import { map } from 'rxjs/operators';
import { AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';
import { LdapDataDTO, AccountLdap } from './dto';
import { ResDTO } from 'src/shared/dto';

@Injectable()
export class LdapService {

    private ldapConfig: {
        url: string,
        credentials: string
    };

    constructor(
        private configService: ConfigService,
        private http: HttpService
    ) {
        this.ldapConfig = this.configService.get('ldap');
    }

    async login(username: string, password: string): Promise<AccountLdap> {

        const data: LdapDataDTO = {
            ldapCredentials: this.ldapConfig.credentials,
            login: { 
                username, password
            }
        }

        const url = `${this.ldapConfig.url}/login`;

        return this.http.post(url, data).pipe(
            map((axiosResponse: AxiosResponse) => {
                const res: ResDTO = axiosResponse.data as ResDTO;
                if (res.type === 'error' || res.data === null) {
                    throw new UnauthorizedException({
                        statusCode: 401,
                        type: "Unauthorized",
                        message: res.message
                    });
                }                
                return new AccountLdap(res.data);
            })).toPromise()
    }


    async verifyActiveUser(username: string ): Promise<boolean> {

        const data: LdapDataDTO = {
            ldapCredentials: this.ldapConfig.credentials,
            search: { 
                username
            }
        }

        const url = `${this.ldapConfig.url}/verify-user`;

        return this.http.post(url, data).pipe(
            map((axiosResponse: AxiosResponse) => {
                const res: ResDTO = axiosResponse.data as ResDTO;
                if (res.type === 'error') { 
                    throw new UnprocessableEntityException({
                        statusCode: 422,
                        type: "Unprocessable Entity",
                        message: res.message
                    });
                }
                return res.data as boolean;
            })).toPromise()
    }

    async searchByUsername(username: string): Promise<AccountLdap> {
        const data: LdapDataDTO = {
            ldapCredentials: this.ldapConfig.credentials,
            search: { username: username }
        }

        const url = `${this.ldapConfig.url}/search-by-username`;

        return this.http.post(url, data).pipe(
            map((axiosResponse: AxiosResponse) => {
                const res: ResDTO = axiosResponse.data as ResDTO;
                if (res.type === 'error') { 
                    throw new UnprocessableEntityException({
                        statusCode: 422,
                        type: "Unprocessable Entity",
                        message: res.message
                    });
                }
                return res.data ? new AccountLdap(res.data) : null;
            })).toPromise()
    }

    async changePassword(username: string, password: string): Promise<AccountLdap> {
        const data: LdapDataDTO = {
            ldapCredentials: this.ldapConfig.credentials,
            changePassword: { username, password }
        }

        const url = `${this.ldapConfig.url}/change-password`;

        return this.http.post(url, data).pipe(
            map((axiosResponse: AxiosResponse) => {
                const res: ResDTO = axiosResponse.data as ResDTO;
                if (res.type === 'error') { 
                    throw new UnprocessableEntityException({
                        statusCode: 422,
                        type: "Unprocessable Entity",
                        message: res.message
                    });
                }
                return res.data ? new AccountLdap(res.data) : null;
            })).toPromise()
    }
}
