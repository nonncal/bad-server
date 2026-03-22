import csrf from 'csurf';
import { Request, Response, NextFunction } from 'express';

export const csrfProtection = csrf({
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    httpOnly: true,
  },
});

export const csrfMiddleware = (req: Request, res: Response, _next: NextFunction) => {
  res.json({ csrfToken: req.csrfToken() });
};

export const csrfErrorHandler = (err: any, _req: Request, res: Response, next: NextFunction) => {
  if(err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ message: 'Invalid csrf token' });
  } else {
    return next(err);
  }
}