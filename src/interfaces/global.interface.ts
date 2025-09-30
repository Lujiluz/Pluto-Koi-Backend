
export interface GeneralResponse<T> {
    status: string
    message: string
    data?: T
}