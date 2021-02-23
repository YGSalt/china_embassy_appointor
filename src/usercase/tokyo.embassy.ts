import { RequestHandler } from '../common/request.handler'
import 'dotenv/config';

interface LoginResult {
    status: number
}

interface FetchAppointmentResult {
    status: number
    data: {
        date: string
        periodOfTimeList: {
            peopleNumber: number
            userNumber: number
        }[]
    }[]
}
const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': `JSESSIONID=1aiubs0rt3m8czgqotaeno8y9; tgw_l7_route=0fb11371c098ba3c3c183a3ceced03fc; pcxSessionId=0128415e-621f-4a37-a2e8-98ee084e997b`
    }
}

export class TokyoEmbassy {
    private readonly _requestHandler: RequestHandler
    private readonly _tokyAddressId = 'e1be0a00f05e40e6badd079ea4db9a87'
    private readonly _loginURL = 'https://ppt.mfa.gov.cn/appo/service/reservation/data/getLastReservationInfo.json'
    private readonly _fetchURL = 'https://ppt.mfa.gov.cn/appo/service/reservation/data/getReservationDateBean.json?rid=0.955904609291351'
    constructor () {
        this._requestHandler = new RequestHandler()
    }
    async fetchAppointable(): Promise<boolean> {
        console.log(`------------Tokyo Appointable Fetch Date(${new Date()})-------------------`)
        const onlineResult = await this.fetchOnlineAppointable().catch((err) => {
            return Promise.reject(err)
        })
        console.log('============>Current Tokyo Appointable(Online)')
        console.log(onlineResult)

        const offlineResult = await this.fetchOfflineAppointable().catch((err) => {
            return Promise.reject(err)
        })
        console.log('============>Current Tokyo Appointable(Offline):')
        console.log(offlineResult)
        console.log(`----------------------------------------------------------------------\n`)
        return onlineResult.length > 0 || offlineResult.length > 0
    }

    private async fetchOnlineAppointable(isRetry = false): Promise<string[]> {
        const params = new URLSearchParams()
        params.append('addressName', '')
        const response = await this._requestHandler
            .post(this._fetchURL, params, config)
            .catch((err) => {
                return Promise.reject(err)
            })
        let result: FetchAppointmentResult = response.data
        if (result.status === -1 && !isRetry) {
            await this.login().catch((err) => {
                return Promise.reject(err)
            })
            return await this.fetchOnlineAppointable(true).catch((err) => {
                return Promise.reject(err)
            })
        } else if (result.status === 0) {
            return await this.getAppointable(result)
        } else {
            throw new Error('Fetch Online Appointable Failed!!!')
        }
    }

    private async fetchOfflineAppointable(isRetry = false): Promise<string[]> {
        const params = new URLSearchParams()
        params.append('addressName', this._tokyAddressId)
        const response = await this._requestHandler
            .post(this._fetchURL, params, config)
            .catch((err) => {
                return Promise.reject(err)
            })
        let result: FetchAppointmentResult = response.data

        if (result.status === -1 && !isRetry) {
            await this.login().catch((err) => {
                return Promise.reject(err)
            })
            return await this.fetchOfflineAppointable(true).catch((err) => {
                return Promise.reject(err)
            })
        } else if (result.status === 0){
            return await this.getAppointable(result)
        } else {
            throw new Error('Fetch Offline Appointable Failed!!!')
        }
    }

    private async getAppointable(result: FetchAppointmentResult): Promise<string[]> {
        const currentAppointable: string[] = []
        result.data.forEach((item) => {
            item.periodOfTimeList.forEach((timeList) => {
                if (timeList.peopleNumber !== timeList.userNumber) {
                    currentAppointable.push(item.date)
                }
            })
        })
        return currentAppointable
    }

    private async login() {
        const params = new URLSearchParams()
        params.append('recordNumber', process.env.TOKYO_APPOINTMENT_ID)
        params.append('questionID', process.env.TOKYO_APPOINTMENT_QUESTION_ID)
        params.append('answer', process.env.TOKYO_APPOINTMENT_ANSWER)
        const response = await this._requestHandler
            .post(this._loginURL, params, config)
            .catch((err) => {
                return Promise.reject(err)
            })
        const result: LoginResult = response.data
        if (result.status !== 0) {
            throw new Error('Login Failed!!')
        }
    }
}