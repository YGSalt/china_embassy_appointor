import { Util } from './common/util'
import { TokyoEmbassy } from './usercase/tokyo.embassy'
import * as path from 'path';
import * as sound from 'sound-play';

async function bootstrap() {
    const tokyo = new TokyoEmbassy()
    const time = parseInt(process.env.ROLLING_TIME) || 60000
    
    while (true) {
        const isAppointable = await tokyo.fetchAppointable().catch((err) => {
            console.log(err)
        })
        if (isAppointable) {
            const filePath = path.join(path.dirname(__dirname), 'assets/alert.mp3')
            sound.play(filePath);
        }
        await Util.sleep(time)
    }
}
bootstrap()