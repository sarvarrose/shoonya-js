import ApiRequest from './ApiRequest'
import sha256 from './utils'

export default class Client {
  readonly #requestInstance: any
  /** authenticated user's ID */
  userId: string
  /** accountId's value will be same as userId */
  accountId: string
  #accessToken: string
  /** debug mode */
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
    this.#accessToken = accessToken ?? ''
    this.debug = debug ?? false

    // TODO: check if there is any api call that can be made witout authentication
    // if not, we do not need to pass accessToken to ApiRequest here
    this.#requestInstance = new ApiRequest(this.#accessToken, this.debug)
  }

  #setAccessToken(accessToken: string): void {
    this.#accessToken = accessToken
    this.#requestInstance.accessToken = accessToken
  }

  #setUserId(userId: string): void {
    this.userId = userId
    this.accountId = userId
  }

  /**
   * @description Login to the Shoonya API
   * **NOTE:** If pin is passed, authentication will be done using pin instead of factor2
   * @param {string} password - Password
   * @param {string} vendorCode - Vendor code
   * @param {string} apiKey - API key
   * @param {string} [factor2] - OTP or TOTP
   * @param {string} [pin] - PIN
   * @param {string} [imei=api] - IMEI of the mobile / MAC address of the desktop
   */
  async login(
    password: string,
    vendorCode: string,
    apiKey: string,
    factor2?: string,
    pin?: string,
    imei?: string
  ): Promise<any> {
    if (!factor2 && !pin) {
      throw new Error('Either factor2 or pin is required')
    }

    const url = pin ? 'pinAuth' : 'login'
    const payload = {
      source: 'API',
      apkversion: 'js:1.0.0',
      uid: this.userId,
      pwd: sha256(password),
      vc: vendorCode,
      appkey: sha256(`${this.userId}|${apiKey}`),
      imei: imei ?? 'api',
      factor2: pin ? undefined : factor2,
      dpin: pin ? sha256(pin) : undefined
    }

    // TODO: set types
    const data = await this.#requestInstance.post(url, payload)

    if (data.stat === 'Not_Ok' || !data.susertoken) {
      throw new Error(data.emsg || 'Login attempt failed')
    }

    this.#setAccessToken(data.susertoken)
    this.#setUserId(data.actid)

    return data
  }

  /**
   * @description Logout
   */
  async logout(): Promise<any> {
    const payload = {
      uid: this.userId
    }

    const data = await this.#requestInstance.post('logout', payload)
    const data = await this.requestInstance.post('logout', payload)

    return data
  }
}
