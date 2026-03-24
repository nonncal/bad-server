import Tokens from 'csrf'
import { Request, Response, NextFunction } from 'express'

const tokens = new Tokens()
const SECRET = 'csrf-secret' // вынеси в env

export const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const secret = req.cookies._csrfSecret || tokens.secretSync()

    if (!req.cookies._csrfSecret) {
        res.cookie('_csrfSecret', secret, {
            httpOnly: true,
            sameSite: 'lax',
        })
    }

    const token = tokens.create(secret)
    res.locals.csrfToken = token

    next()
}

export const csrfTokenHandler = (_req: Request, res: Response) => {
    res.json({ csrfToken: res.locals.csrfToken })
}

export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['csrf-token']
    const secret = req.cookies._csrfSecret

    if (!token || !secret || !tokens.verify(secret, token as string)) {
        return res.status(403).json({ message: 'Invalid CSRF token' })
    }

    next()
}