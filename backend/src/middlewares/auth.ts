import { NextFunction, Request, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { ACCESS_TOKEN } from '../config'
import ForbiddenError from '../errors/forbidden-error'
import UnauthorizedError from '../errors/unauthorized-error'
import UserModel, { Role } from '../models/user'

const auth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header('Authorization')

    if (!authHeader?.startsWith('Bearer ')) {
        return next(new UnauthorizedError('Невалидный токен'))
    }

    try {
        const token = authHeader.split(' ')[1]

        const payload = jwt.verify(token, ACCESS_TOKEN.secret) as JwtPayload

        const user = await UserModel.findById(payload._id)

        if (!user) {
            return next(new ForbiddenError('Нет доступа'))
        }

        res.locals.user = user
        return next()
    } catch (error) {
        if (error instanceof Error && error.name === 'TokenExpiredError') {
            return next(new UnauthorizedError('Истек срок действия токена'))
        }
        return next(new UnauthorizedError('Необходима авторизация'))
    }
}

export function roleGuardMiddleware(...roles: Role[]) {
    return (_req: Request, res: Response, next: NextFunction) => {
        if (!res.locals.user) {
            return next(new UnauthorizedError('Необходима авторизация'))
        }

        const hasAccess = roles.some((role) =>
            res.locals.user.roles.includes(role)
        )

        if (!hasAccess) {
            return next(new ForbiddenError('Доступ запрещен'))
        }

        return next()
    }
}

export default auth