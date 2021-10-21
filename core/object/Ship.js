import Mass from './Mass';
import Projectile from './Projectile';
import { draw_ship } from '../Drawing';

export default class Ship extends Mass {

    constructor(x, y, mass, radius, power, weapon_power) {
        super(x, y, mass, radius, 1.5 * Math.PI);

        this.aft_cool_down = 0.025;
        this.bow_cool_down = 0.0125;
        this.thruster_power = power;
        this.weapon_power = weapon_power;
        this.weapon_reload_time = 0.25; //seconds
        this.steering_power = this.thruster_power / 20;
        this.right_thruster = false;
        this.left_thruster = false;
        this.thruster_on = false;
        this.retro_on = false;
        this.loaded = false;
        this.time_until_reloaded = this.weapon_reload_time;
        this.compromised = false;
        this.max_health = 2.0;
        this.health = this.max_health;
    }

    update(ctx, elapsed) {
        if(!this.thruster_on) this.slowdown();
        this.slowTurn();
        this.push(this.angle, this.thruster_on * this.thruster_power, elapsed);
        this.twist((this.right_thruster - this.left_thruster) * this.steering_power, elapsed);
        this.loaded = this.time_until_reloaded === 0;
        if(!this.loaded)
            this.time_until_reloaded -= Math.min(elapsed, this.time_until_reloaded);
        if(this.compromised) this.health -= Math.min(elapsed, this.health);
        super.update(ctx, elapsed);
    }

    draw(c, guide) {
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.angle);
        if(this.compromised) {
            c.save();
            c.fillStyle = `rgba(255, 192, 192,${this.health / 2})`;
            c.beginPath();
            c.arc(0, 0, this.radius, 0, 2 * Math.PI);
            c.fill();
            c.restore();
        }
        draw_ship(c, this.radius, {...guide, thruster: this.thruster_on});
        c.restore();
    }

    projectile(elapsed) {
        const projectile = new Projectile(
            this.x + Math.cos(this.angle) * this.radius,
            this.y + Math.sin(this.angle) * this.radius,
            0.025,
            2,
            this.speedX,
            this.speedY,
            this.speedRotation
        );

        projectile.push(this.angle, this.weapon_power, elapsed);
        this.push(this.angle + Math.PI, this.weapon_power, elapsed);
        
        this.time_until_reloaded = this.weapon_reload_time; 

        return projectile;
    }

    slowdown() {
        if(this.speedX > 0.1) this.speedX -= this.speedX * this.aft_cool_down;
        else if (this.speedX < -0.1) this.speedX += -this.speedX * this.aft_cool_down;

        if(this.speedY > 0.1) this.speedY -= this.speedY * this.aft_cool_down;
        else if (this.speedY < -0.1) this.speedY += -this.speedY * this.aft_cool_down;
    }

    slowTurn() {
        if(this.speedRotation > 0.01) this.speedRotation -= this.speedRotation * this.bow_cool_down;
        else if(this.speedRotation < -0.1) this.speedRotation += -this.speedRotation * this.bow_cool_down;
    }

    rewardHealth() {
        const quarter_health = this.max_health / 4;
        this.health = this.health > quarter_health * 3 ? this.max_health : this.health + quarter_health;
    }
}