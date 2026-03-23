import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import rateLimit from 'express-rate-limit'
import { DB_ADDRESS } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'
import { csrfErrorHandler, csrfMiddleware, csrfProtection } from './middlewares/csrf'

const { PORT = 3000 } = process.env
const app = express()

app.use(cookieParser())

app.use(cors({ origin: process.env.ORIGIN_ALLOW, credentials: true }));
// app.use(express.static(path.join(__dirname, 'public')));

app.get('/auth/csrf-token', csrfProtection, csrfMiddleware)

app.use((req, res, next) => {
    const isAuthRoute = req.path.startsWith('/auth')

    if (!isAuthRoute && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return csrfProtection(req, res, next)
    }

    return next()
})

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(urlencoded({ extended: true , limit: '5mb'}))
app.use(json({limit: '5mb'}))

app.options('*', cors())

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 , limit: 50}))
app.use(routes)
app.use(errors())
app.use(csrfErrorHandler)
app.use(errorHandler)

// eslint-disable-next-line no-console

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
