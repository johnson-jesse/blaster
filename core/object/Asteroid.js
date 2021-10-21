import Mass from './Mass';
import { draw_asteroid } from '../Drawing';
import Particle from './Particle';

export default class Asteroid extends Mass {
    constructor(x, y, mass, speedX, speedY, speedRotation) {
        super(x, y, mass, 0, 0, speedX, speedY, speedRotation);
        
        this.radius = Math.sqrt((mass / Asteroid.DENSITY) / Math.PI);
        this.circumference = 2 * Math.PI * this.radius;
        this.segments = Math.ceil(this.circumference / 15);
        this.segments = Math.min(25, Math.max(5, this.segments));
        this.noise = 0.2;
        this.shape = [];

        for (let i = 0; i < this.segments; i++) {
            this.shape.push(Math.random() - 0.5);
        }
    }

    draw(c, guide) {
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.angle);
        draw_asteroid(c, this.radius, this.shape, { guide, noise: this.noise });
        c.restore();
    }

    child(mass) {
        return new Asteroid(this.x, this.y, mass, this.speedX, this.speedY, this.speedRotation);
    }

    explode(elapsed) {
        const result =  [];

        for(let x = 0; x < 11; x++) {
            const p = new Particle(this.x, this.y, 0.065, .5);
            p.push(Math.random() * (2 * Math.PI), Math.random() * 1000, elapsed);
            result.push(p);
        }

        return result;
    }

    static get DENSITY() {
        return 1;
    }
}