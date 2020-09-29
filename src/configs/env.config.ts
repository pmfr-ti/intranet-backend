export const config = (): any => ({
  port: Number(process.env.API_PORT),
  jwtKey: process.env.JWT_KEY,
  jwtExpirationTime: process.env.JWT_EXPIRATIONTIME,
  jwtRenewalTimeDefault: process.env.JWT_RENEWALTIME_DEFAULT,
  jwtRenewalTimeLong: process.env.JWT_RENEWALTIME_LONG,
  database: {
    type: process.env.DATABASE_TYPE,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE_NAME,
    entities: ["dist/**/*.entity{.ts,.js}"],
    synchronize: true,
  },
  mailerConfig: {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
  },
  ldap: {
    url: `${process.env.ADLDAP_HOST}:${process.env.ADLDAP_PORT}/ldap`,
    credentials: process.env.ADLDAP_CREDENTIALS,
  }
});
