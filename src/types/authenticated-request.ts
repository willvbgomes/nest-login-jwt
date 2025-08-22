import { Request } from 'express';

export type AuthenticatedRequest = Request & {
  user?: {
    sub: string;
    email: string;
    iat: number;
    exp: number;
  };
};
