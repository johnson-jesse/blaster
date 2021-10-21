export default class Mass {
    constructor(x, y, mass, radius, angle, speedX, speedY, speedRotation, wraps = true) {
        this.x = x;
        this.y = y;

        this.mass = mass || 1;
        this.radius = radius || 50;

        this.angle = angle || 0;
        this.speedX = speedX || 0;
        this.speedY = speedY || 0;
        this.speedRotation = speedRotation || 0;
        this.wraps = wraps;
    }

    speedRotation(rotation) {
        this.speedRotation = rotation;
        return this;
    }

    update(ctx, elapsed) {
        this.x += this.speedX * elapsed;
        this.y += this.speedY * elapsed;
        this.angle += this.speedRotation * elapsed;
        this.angle %= (2 * Math.PI);

        if (this.wraps) {
            if (this.x - this.radius > ctx.canvas.width) this.x = -this.radius;
            if (this.x + this.radius < 0) this.x = ctx.canvas.width + this.radius;
            if (this.y - this.radius > ctx.canvas.height) this.y = -this.radius;
            if (this.y + this.radius < 0) this.y = ctx.canvas.height + this.radius;
        }
    }

    push(angle, force, elapsed) {
        this.speedX += elapsed * (Math.cos(angle) * force) / this.mass;
        this.speedY += elapsed * (Math.sin(angle) * force) / this.mass;
    }

    twist(force, elapsed) {
        this.speedRotation += elapsed * force / this.mass;
    }

    speed() {
        return Math.sqrt(Math.pow(this.speedX, 2) + Math.pow(this.speedY, 2));
    }

    movement_angle() {
        return Math.atan2(this.speedY, this.speedX);
    }

    draw(c) {
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.angle);
        c.beginPath();
        c.arc(0, 0, this.radius, 0, 2 * Math.PI);
        c.lineTo(0, 0);
        c.strokeStyle = 'white';
        c.stroke();
        c.restore();
    }
}