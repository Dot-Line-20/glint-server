import 'express';

declare module 'express' {
  interface Request {
    config?: any;
  }
}