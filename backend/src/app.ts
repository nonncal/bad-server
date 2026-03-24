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
import { csrfMiddleware, csrfProtection, csrfTokenHandler } from './middlewares/csrf'

const { PORT = 3000 } = process.env
const { ORIGIN_ALLOW } = process.env
const app = express()

app.use(cookieParser())

app.use(cors({ 
    origin: ORIGIN_ALLOW,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// app.use(express.static(path.join(__dirname, 'public')));

app.get('/auth/csrf-token', csrfMiddleware, csrfTokenHandler)

app.use((req, res, next) => {
    if (
        req.path.startsWith('/auth') || 
        ['GET', 'HEAD', 'OPTIONS'].includes(req.method)
    ) {
        return next()
    }

    return csrfProtection(req, res, next)
})

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(urlencoded({ extended: true , limit: '10mb'}))
app.use(json({limit: '10mb'}))

app.options('*', cors({}))

const limit = rateLimit({
  windowMs: 1000, 
  max: 5,
  message: { error: 'Слишком много запросов.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limit)
app.use(routes)
app.use(errors())
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
