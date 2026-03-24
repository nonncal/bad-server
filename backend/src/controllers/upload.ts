import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import BadRequestError from '../errors/bad-request-error'
import fs from 'fs/promises'
import { fileTypeFromBuffer } from 'file-type'

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }
    try {
        if (req.file.size > 1024 * 1024 * 10) {
            return next(new BadRequestError('Размер файла не должен превышать 10 МБ'))
        }
        if (req.file.size < 2 * 1024) {
            return next(new BadRequestError('Файл меньше 2KB)'))
        }

        const fileBuffer = await fs.readFile(req.file.path)
        const type = await fileTypeFromBuffer(new Uint8Array(fileBuffer))
        
        if (!type || !type.mime.startsWith('image/')) {
            await fs.unlink(req.file.path).catch(() => {});
            return next(new BadRequestError('Файл не является изображением'));
        }

        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${req.file.filename}`
            : `/${req.file?.filename}`
        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName,
            originalName: req.file?.originalname,
        })
    } catch (error) {
        if (req.file?.path) {
            await fs.unlink(req.file.path).catch(() => {});
        }
        return next(error)
    }
}

export default {}
