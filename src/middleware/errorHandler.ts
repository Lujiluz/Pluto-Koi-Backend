import { Request, Response, NextFunction } from "express"
class CustomErrorHandler extends Error {
    statusCode: number
    message: string

    constructor(statusCode: number, message: string) {
        super()
        this.statusCode = statusCode
        this.message = message
    }
}

const errorHandler = (err: CustomErrorHandler, req: Request, res: Response, next: NextFunction) => {
    const { statusCode, message } = err
    
    res.status(statusCode || 500).json({
        status: 'error',
        statusCode,
        message
    })
}

export { CustomErrorHandler, errorHandler }