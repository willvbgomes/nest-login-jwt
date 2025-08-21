import { Request } from 'express';

export type AuthorizedRequest = Request & {
  user?: {
    sub: string;
    email: string;
    iat: number;
    exp: number;
  };
};
