import Mass from './Mass';
import { draw_projectile } from '../Drawing';

export default class Projectile extends Mass {

    constructor(x, y, mass, lifetime, speedX, speedY, speedRotation) {
        super(x, y, mass, 0, 0, speedX, speedY, speedRotation);
        const density = 0.001;
        this.radius = Math.sqrt((mass / density) / Math.PI);
        this.lifetime = lifetime;
        this.life = 1.0;
    }

    update(c, elapsed) {
        this.life -= (elapsed / this.lifetime);
        super.update(c, elapsed);
    }

    draw(c, guide) {
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.angle);
        draw_projectile(c, this.radius, this.life, guide);
        c.restore();
    }
}