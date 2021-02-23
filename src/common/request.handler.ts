import axios from 'axios'
import { AxiosResponse, AxiosRequestConfig } from 'axios'

export class RequestHandler {
    async post(url: string, args?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
        return await axios.post(url, args, config).catch((err) => {
            return Promise.reject(err)
        })
    }

    async get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
        return await axios.get(url, config).catch((err) => {
            return Promise.reject(err)
        })
    }
}