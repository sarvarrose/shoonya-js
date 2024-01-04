import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import routes from './routes.json'

/**
 * @description Class to make API requests to the Shoonya API
 * @property {string} [accessToken] - The access token to use for the API requests
 * @property {boolean} [debug] - Whether to log debug information to the console
 */
export default class ApiRequest {
  static baseURL = 'https://api.shoonya.com/NorenWClientTP'
  accessToken: string
  debug: boolean
  requestInstance: any

  constructor(accessToken?: string, debug?: boolean) {
    this.accessToken = accessToken ?? ''
    this.debug = debug ?? false

    this.requestInstance = axios.create({ baseURL: ApiRequest.baseURL })

    this.requestInstance.interceptors.request.use(
      (request: AxiosRequestConfig) => {
        if (this.debug) {
          console.info('Request: ', {
            url: request.url,
            method: request.method,
            data: request.data
          })
        }

        return request
      }
    )

    this.requestInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        if (this.debug) {
          console.info('Response: ', {
            url: response.config.url,
            method: response.config.method,
            data: response.data
          })
        }

        return response.data
      },
      async (error: any) => {
        if (this.debug) {
          console.error(error)
        }

        return await Promise.reject(error)
      }
    )
  }

  async post(
    route: keyof typeof routes,
    params?: Record<string, any>
  ): Promise<AxiosResponse<any, any>> {
    // compose payload
    let payload = 'jData=' + JSON.stringify(params)
    if (this.accessToken !== '') {
      payload = payload + `&jKey=${this.accessToken}`
    }

    const response = await this.requestInstance.post(routes[route], payload)

    return response
  }
}
