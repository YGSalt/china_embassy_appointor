import { Util } from './common/util'
import { TokyoEmbassy } from './usercase/tokyo.embassy'

async function bootstrap() {
    const tokyo = new TokyoEmbassy()
    const time = parseInt(process.env.ROLLING_TIME) || 60000
    Util.playAlert();
    while (true) {
        const isAppointable = await tokyo.fetchAppointable().catch((err) => {
            console.log(err)
        })
        if (isAppointable) {
            Util.playAlert();
        }
        await Util.sleep(time)
    }
}
bootstrap()