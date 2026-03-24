import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

export default function serveStatic(baseDir: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const resolvedBaseDir = path.resolve(baseDir)
        const requestedPath = req.path.startsWith('/')
            ? `.${req.path}`
            : req.path
        const filePath = path.resolve(resolvedBaseDir, requestedPath)

        if (
            filePath !== resolvedBaseDir &&
            !filePath.startsWith(`${resolvedBaseDir}${path.sep}`)
        ) {
            return next()
        }

        // Проверяем, существует ли файл
        fs.access(filePath, fs.constants.F_OK, (accessError) => {
            if (accessError) {
                // Файл не существует отдаем дальше мидлварам
                return next()
            }
            // Файл существует, отправляем его клиенту
            return res.sendFile(filePath, (sendFileError) => {
                if (sendFileError) {
                    next(sendFileError)
                }
            })
        })
    }
}
