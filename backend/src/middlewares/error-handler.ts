import { isCelebrateError } from 'celebrate'
import { ErrorRequestHandler } from 'express'
import { MulterError } from 'multer'

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
    if (res.headersSent) {
        return next(err)
    }

    if (isCelebrateError(err)) {
        const validationError = Array.from(err.details.values())[0]
        const message =
            validationError?.details[0]?.message ||
            'Переданы некорректные данные'

        return res.status(400).send({ message })
    }

    if (err instanceof MulterError) {
        const statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400
        const message =
            err.code === 'LIMIT_FILE_SIZE'
                ? 'Размер файла не должен превышать 10 МБ'
                : 'Ошибка загрузки файла'

        return res.status(statusCode).send({ message })
    }

    if (err?.type === 'entity.too.large') {
        return res
            .status(413)
            .send({ message: 'Размер запроса превышает допустимый лимит' })
    }

    const statusCode = err.statusCode || 500
    const message =
        statusCode === 500 ? 'На сервере произошла ошибка' : err.message
    console.log(err)

    return res.status(statusCode).send({ message })
}

export default errorHandler
