import * as path from 'path';
import * as sound from 'sound-play';

export class Util {
    static async sleep(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }
    static playAlert() {
        const filePath = path.join(process.cwd(), 'assets/alert.mp3')
        sound.play(filePath);
    }
}