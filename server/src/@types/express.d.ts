import 'express'
import jwt from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      auth?: jwt.JwtPayload // { uid: string; role: string }
    }
  }
}
