import ApiRequest from './ApiRequest'
import sha256 from './utils'

export default class Client {
  requestInstance: any
  userId: string
  /** accountId's value will be same as userId */
  accountId: string
  accessToken: string
  debug: boolean

  constructor({
    userId,
    accessToken,
    debug
  }: {
    userId: string
    accessToken?: string
    debug?: boolean
  }) {
    this.userId = userId
    this.accountId = userId
    this.accessToken = accessToken ?? ''
    this.debug = debug ?? false

    // TODO: check if there is any api call that can be made witout authentication
    // if not, we do not need to pass accessToken to ApiRequest here
    this.requestInstance = new ApiRequest(this.accessToken, this.debug)
  }

  setAccessToken(accessToken: string): void {
    this.accessToken = accessToken
    this.requestInstance.accessToken = accessToken
  }

  setUserId(userId: string): void {
    this.userId = userId
    this.accountId = userId
  }

  /**
   * @param {string} password - Password
   * @param {string} factor2 - OTP or TOTP
   * @param {string} vendorCode - Vendor code
   * @param {string} apiKey - API key
   * @param {string} [imei=api] - IMEI of the mobile / MAC address of the desktop
   */
  async login(
    password: string,
    factor2: string,
    vendorCode: string,
    apiKey: string,
    imei?: string
  ): Promise<any> {
    const payload = {
      source: 'API',
      apkversion: 'js:1.0.0',
      uid: this.userId,
      pwd: sha256(password),
      factor2,
      vc: vendorCode,
      appkey: sha256(`${this.userId}|${apiKey}`),
      imei: imei ?? 'api'
    }

    // TODO: set types
    const data = await this.requestInstance.post('login', payload)

    if (data.stat === 'Not_Ok' || !data.susertoken) {
      throw new Error(data.emsg || 'Login attempt failed')
    }

    this.setAccessToken(data.susertoken)
    this.setUserId(data.actid)

    return data
  }

  async logout(): Promise<any> {
    const payload = {
      uid: this.userId
    }

    const data = await this.requestInstance.post('logout', payload)

    return data
  }
}
