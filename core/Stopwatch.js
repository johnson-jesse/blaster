export default class Stopwatch {

    constructor() {
        this.restart();
    }

    restart() {
        this.minutes = 0;
        this.seconds = 0;
        this.tick = 0;
    }

    uptick() {
        this.tick++;
        if(Math.floor(this.tick / 60) === 1) {
            this.tick = 0;
            this.seconds++;
        }

        if(this.seconds === 60) {
            this.seconds = 0;
            this.minutes = 1;
        }

        return this;
    }

    time() {
        return `${Stopwatch.pad0(this.minutes, 2)}:${Stopwatch.pad0(this.seconds, 2)}`;
    }

    get minute() {
        return this.minutes;
    }

    get second() {
        return this.seconds;
    }

    static pad0(digit) {
        return digit.toString().padStart(2, '0');
    }
}