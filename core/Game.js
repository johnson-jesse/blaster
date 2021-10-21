import Ship from './object/Ship';
import Asteroid from './object/Asteroid';
import { Indicator, NumberIndicator, Message, StringIndicator } from './object/Hud';
import { draw_line, draw_grid } from './Drawing';
import Stopwatch from './Stopwatch';

const State = Object.freeze({
    RUNNING: 'RUNNING',
    OVER: 'OVER',
    PAUSED: 'PAUSED'
});

export default class Game {

    constructor(ctx) {
        this.ctx = ctx;

        this.guide = false;
        this.fps = 0;

        this.score = 0;
        this.level = 0;
        this.state = State.RUNNING;
        this.stopwatch = new Stopwatch();

        this.projectiles = [];
        this.asteroids = [];
        this.brokenroids = [];

        this.asteroid_mass = 10000; // mass of asteroids
        this.asteroid_push = 5000000; // max force to apply in one frame
        this.mass_destroyed = 500;

        this.initializeShip();
        this.initializeListeners();
        this.initializeHUD();

        this.ctx.canvas.focus();
        window.requestAnimationFrame(t => this.frame(t));
    }

    initializeListeners() {
        this.ctx.canvas.addEventListener('keydown', e => this.handleKey(e, true));
        this.ctx.canvas.addEventListener('keyup', e => this.handleKey(e, false));
    }

    initializeHUD() {
        this.health_indicator = new Indicator(5, 5, 'shields', 100, 10);
        this.score_indicator = new NumberIndicator(this.ctx.canvas.width - 10, 5, 'score');
        this.time_indicator = new StringIndicator(this.ctx.canvas.width - 100, 5, 'time');
        this.fps_indicator = new NumberIndicator(this.ctx.canvas.width - 10, this.ctx.canvas.height - 15, 'fps', { digits: 2 });
        this.level_indicator = new NumberIndicator(25, this.ctx.canvas.height - 15, 'level', { align: 'center' });
        this.message = new Message(this.ctx.canvas.width / 2, this.ctx.canvas.height * 0.4);
    }

    initializeShip() {
        this.ship_mass = 10;
        this.ship_radius = 15;
        this.ship = this.makeShip();
    }

    makeShip() {
        return new Ship(
            this.ctx.canvas.width / 2,
            this.ctx.canvas.height / 2,
            this.ship_mass,
            this.ship_radius,
            1000, 200
        );
    }

    handleKey(e, value) {
        let nothing_handled = false;
        switch (e.key || e.keyCode) {
            case 'ArrowUp':
            case 38:
                this.ship.thruster_on = value;
                break;
            case 'ArrowLeft':
            case 37:
                this.ship.left_thruster = value;
                break;
            case 'ArrowRight':
            case 39:
                this.ship.right_thruster = value;
                break;
            case 'ArrowDown':
            case 40:
                this.ship.retro_on = value;
                break;
            case ' ':
            case 32: // spacebar
                this.ship.trigger = value;
                break;
            case 'g':
            case 71:
                if (value) this.guide = !this.guide;
                break;
            case 'p':
            case 80:
                if( !this.isGameOver && !value ) this.state = this.isGamePaused ? State.RUNNING : State.PAUSED;
                break;
            case 'a':
            case '65':
                if (this.isGameOver) this.reset_game();
                break;
            default:
                nothing_handled = true;
                break;
        }
        if (!nothing_handled) e.preventDefault();
    }

    moving_asteroid(elapsed) {
        const asteroid = this.makeAsteroid();
        this.push_asteroid(asteroid, elapsed);
        return asteroid;
    }

    makeAsteroid() {
        return new Asteroid(
            this.ctx.canvas.width * Math.random(),
            this.ctx.canvas.height * Math.random(),
            this.asteroid_mass
        );
    }

    push_asteroid(asteroid, elapsed = 0.015) {
        asteroid.push(2 * Math.PI * Math.random(), this.asteroid_push, elapsed);
        asteroid.twist((Math.random() - 0.5) * Math.PI * this.asteroid_push * 0.02, elapsed);
    }

    frame(timestamp) {
        if (!this.previous) this.previous = timestamp;
        let elapsed = timestamp - this.previous;
        this.fps = 1000 / elapsed;
        this.update(elapsed / 1000);
        this.draw();
        this.previous = timestamp;
        window.requestAnimationFrame(t => this.frame(t));
    }

    update(elapsed) {
        if (!this.isGamePaused) {
            if (this.asteroids.length === 0) this.level_up();

            this.ship.compromised = false;
            this.asteroids.forEach(a => {
                a.update(this.ctx, elapsed);
                if (Game.collision(a, this.ship)) this.ship.compromised = true;
            });

            if (this.ship.health <= 0) {
                this.state = State.OVER;
                return;
            }

            this.stopwatch.uptick();
            this.ship.update(this.ctx, elapsed);
            this.brokenroids.forEach((b, index, brokenroids) => {
                b.update(this.ctx, elapsed);
                if(b.life <= 0) {
                    brokenroids.splice(index, 1);
                }
            });
            this.projectiles.forEach((p, index, projectiles) => {
                p.update(this.ctx, elapsed);
                if (p.life <= 0) {
                    projectiles.splice(index, 1);
                    this.score -= (this.score === 0 ? 0 : 3);
                }
                else {
                    this.asteroids.forEach((a, j) => {
                        if (Game.collision(a, p)) {
                            projectiles.splice(index, 1);
                            this.asteroids.splice(j, 1);
                            this.split_asteroid(a, elapsed);
                        }
                    });
                }
            });
            if (this.ship.trigger && this.ship.loaded)
                this.projectiles.push(this.ship.projectile(elapsed));
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        if (this.guide) {
            draw_grid(this.ctx);
            this.asteroids.forEach(a => {
                draw_line(this.ctx, a, this.ship);
                this.projectiles.forEach(p => draw_line(this.ctx, a, p));
            });
            this.fps_indicator.draw(this.ctx, this.fps);
        }

        this.health_indicator.draw(this.ctx, this.ship.health, this.ship.max_health, this.ship.health);
        this.score_indicator.draw(this.ctx, this.score);
        this.time_indicator.draw(this.ctx, this.stopwatch.time());

        this.asteroids.forEach(a => a.draw(this.ctx, this.guide));
        this.level_indicator.draw(this.ctx, this.level);

        if(this.isGameOver) {
            this.message.draw(this.ctx, 'GAME OVER', 'Press \'a\' to play again');
            return;
        }
            
        if(this.isGamePaused) this.message.draw(this.ctx, 'PAUSED', '');

        this.ship.draw(this.ctx, this.guide);
        this.brokenroids.forEach(b => b.draw(this.ctx));
        this.projectiles.forEach(p => p.draw(this.ctx));
    }

    split_asteroid(asteroid, elapsed) {
        asteroid.mass -= this.mass_destroyed;
        this.score += this.mass_destroyed;
        const split = 0.25 + 0.5 * Math.random(); // split unevenly
        const ch1 = asteroid.child(asteroid.mass * split);
        const ch2 = asteroid.child(asteroid.mass * (1 - split));
        [ch1, ch2].forEach(child => {
            if (child.mass < this.mass_destroyed) {
                this.score += child.mass;
            } else {
                this.push_asteroid(child, elapsed);
                this.asteroids.push(child);
            }
        });

        this.brokenroids = this.brokenroids.concat(asteroid.explode(elapsed));
        console.log(this.brokenroids);
    }

    reset_game() {
        this.state = State.RUNNING;
        this.score = 0;
        this.level = 0;
        this.ship = this.makeShip();
        this.projectiles = [];
        this.asteroids = [];
        this.level_up();
    }

    level_up() {
        this.scoreBonus();
        this.level += 1;

        for (let i = 0; i < this.level; i++) {
            this.asteroids.push(this.moving_asteroid());
        }

        this.stopwatch.restart();
    }

    scoreBonus() {
        if (!this.isGameOver && this.level > 0) {
            if (this.stopwatch.minute <= this.level + 1) this.score += 5000;
            this.ship.rewardHealth();
        }
    }

    get isGameOver() {
        return this.state === State.OVER;
    }

    get isGamePaused() {
        return this.state === State.PAUSED;
    }

    get isGameRunning() {
        return this.state === State.RUNNING;
    }

    static collision(obj1, obj2) {
        return Game.distance_between(obj1, obj2) < (obj1.radius + obj2.radius);
    }

    static distance_between(obj1, obj2) {
        return Math.sqrt(Math.pow(obj1.x - obj2.x, 2) + Math.pow(obj1.y - obj2.y, 2));
    }
}