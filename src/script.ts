// Interface of scenes
interface Scene {
    Render(): void;
}

// Interface of objects such as aircrafts, bullets, etc
interface Object {
    x: number;
    y: number;
    Move(scene: GameScene): void;
    Render(scene: GameScene): void;
}

// Class of game scene
// This class controls all instances of objects
class GameScene implements Scene {
    // Fields
    private frameCount: number;
    private score: number;

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private width: number;
    private heigtht: number;

    private img_me: CanvasImageSource;
    private me: Me;

    private img_enemy: CanvasImageSource;
    private enemies: Array<Enemy>;

    private shots: Array<Shot>;

    // Properties
    public get Context(): CanvasRenderingContext2D {
        return this.ctx;
    }

    public get Width(): number {
        return this.canvas.width;
    }

    public get Height(): number {
        return this.canvas.height;
    }

    public get Me(): Me {
        return this.me;
    }

    public get Img_Me(): CanvasImageSource {
        return this.img_me;
    }

    public get Enemy(): Array<Enemy> {
        return this.Enemy;
    }

    public get Img_Enemy(): CanvasImageSource {
        return this.img_enemy;
    }

    // Constrctor
    constructor(canvas: HTMLCanvasElement) {
        this.frameCount = 0;
        this.score = 0;

        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;

        this.canvas.width = 1000;
        this.canvas.height = 600;

        this.width = this.canvas.width;
        this.heigtht = this.canvas.height;

        this.img_me = new Image();
        this.img_me.src = "img/fighter.png";
        this.me = new Me(this);

        this.img_enemy = new Image();
        this.img_enemy.src = "img/missile.png";
        this.enemies = new Array();

        for (let i = 0; i < 5; i++) {
            this.enemies.push(new Enemy(this));
        }

        this.shots = new Array();

        window.addEventListener("keydown", this.keyDown.bind(this));
        window.addEventListener("keyup", this.keyUp.bind(this));
    }

    // Methods
    // Callback function binded to keydown
    private keyDown(e: KeyboardEvent): void {
        const key = e.key;

        switch (key) {
            // Direction of moving
            case "ArrowUp":
                this.me.upFlag = true;
                this.me.downFlag = false;
                this.me.forwardFlag = false;
                this.me.backFlag = false;
                break;
                break;
            case "ArrowDown":
                this.me.upFlag = false;
                this.me.downFlag = true;
                this.me.forwardFlag = false;
                this.me.backFlag = false;
                break;
            case "ArrowRight":
                this.me.upFlag = false;
                this.me.downFlag = false;
                this.me.forwardFlag = true;
                this.me.backFlag = false;
                break;
            case "ArrowLeft":
                this.me.upFlag = false;
                this.me.downFlag = false;
                this.me.forwardFlag = false;
                this.me.backFlag = true;
                break;
            // Fire
            case "z":
            case "Z":
                // Prohibit rapid fire
                if (e.repeat) {
                    break;
                }
                const shot = new Shot(this);
                shot.x = this.me.x + this.me.Width * 0.45;
                shot.y = this.me.y;

                let pushed = false;
                for (let i = 0; i < this.shots.length; i++) {
                    if (!this.shots[i].live) {
                        this.shots[i] = shot;
                        pushed = true;
                        break;
                    }
                }

                if (!pushed) {
                    this.shots.push(shot);
                }
                break;
            // Slow down
            case "Shift":
                this.me.slowFlag = true;
            default:
                break;
        }
    }

    // Callback function binded to keyup
    private keyUp(e: KeyboardEvent): void {
        const key = e.key;

        switch (key) {
            // Stop moving
            case "ArrowUp":
                this.me.upFlag = false;
                break;
            case "ArrowDown":
                this.me.downFlag = false;
                break;
            case "ArrowRight":
                this.me.forwardFlag = false;
                break;
            case "ArrowLeft":
                this.me.backFlag = false;
                break;
            case "Shift":
                this.me.slowFlag = false;
            default:
                break;
        }
    }

    // Render game scene
    public Render(): void {
        // Increment frame counter
        this.frameCount++;

        if (this.me.alive) {
            // Move enemies
            for (let i = 0; i < this.enemies.length; i++) {
                this.enemies[i].Move(this);
            }

            // Move player's aircraft
            this.me.Move(this);

            // Move player's shots
            for (let i = 0; i < this.shots.length; i++) {
                this.shots[i].Move(this);
            }

            // Enemy collision detection
            for (let i = 0; i < this.shots.length; i++) {
                for (let j = 0; j < this.enemies.length; j++) {
                    let isHit = this.enemies[j].IsHit(this.shots[i]);
                    if (isHit) {
                        this.enemies[j].alive = false;
                    }
                }
            }

            // If the bullet is off the screen, set a new bullet
            for (let i = 0; i < this.enemies.length; i++) {
                for (let k = 0; k < this.shots.length; k++) {
                    if (this.shots[k].live) {
                        if (this.enemies[i].IsHit(this.shots[k])) {
                            this.shots[k].live = false;
                            this.enemies[i].SetStartPosition(this);

                            this.score += 100;
                        }
                    }
                }
            }

            // Player collision detection
            for (let i = 0; i < this.enemies.length; i++) {
                const isHit = this.me.IsHit(this.enemies[i]);
                if (isHit) {
                    this.me.alive = false;
                    break;
                }
            }

            // Generate a enemy every 300 frames
            if (this.frameCount % 300 == 0) {
                this.enemies.push(new Enemy(this));
            }
        }

        // Render background
        this.ctx.fillStyle = "rgb(107, 195, 255)";
        const grd = this.ctx.createLinearGradient(0, 0, 0, this.heigtht);
        grd.addColorStop(0, "#0000A0"); // Earth Blue
        grd.addColorStop(1, "#C2DFFF"); // Sea Blue
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render enemies
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].Render(this);
        }

        // Render player
        this.me.Render(this);

        // Render player's shots
        for (let i = 0; i < this.shots.length; i++) {
            this.shots[i].Render(this);
        }

        // Render letters
        if (this.me.alive) {
            this.ctx.font = "bold 15px Verdana";
            const txtDesc = "↑:Up  ↓:Down  →:Forward ←:Back Z:Shoot  Shift:Reduce speed";

            this.ctx.strokeStyle = "rgb(0, 0, 0)";
            this.ctx.strokeText(txtDesc, 5, 25);

            this.ctx.fillStyle = "rgb(255, 255, 255)";
            this.ctx.fillText(txtDesc, 5, 25);

            const tmScore = this.ctx.measureText(txtDesc);
            const txtScore = "Score : " + this.score;
            this.ctx.strokeStyle = "rgb(0, 0, 0)";
            this.ctx.strokeText(txtScore, tmScore.width + 30, 25);
            this.ctx.fillText(txtScore, tmScore.width + 30, 25);
        } else {
            // End screen
            this.ctx.font = "bold 80px Verdana";
            const txtGame = "Game Over";
            const tmGame = this.ctx.measureText(txtGame);

            this.ctx.strokeStyle = "rgb(0, 0, 0)";
            this.ctx.strokeText(
                txtGame,
                this.width / 2 - tmGame.width / 2,
                this.heigtht / 2
            );

            this.ctx.fillStyle = "rgb(255, 255, 255)";
            this.ctx.fillText(
                txtGame,
                this.width / 2 - tmGame.width / 2,
                this.heigtht / 2
            );

            // Render score
            this.ctx.font = "bold 40px Verdana";
            const txtScore = "Score: " + this.score;
            this.ctx.fillStyle = "rgb(255, 255, 255)";
            const tmScore = this.ctx.measureText(txtScore);
            this.ctx.fillText(
                txtScore,
                this.width / 2 - tmScore.width / 2,
                this.heigtht / 2 + 50
            );
            this.ctx.strokeStyle = "rgb(0, 0, 0)";
            this.ctx.strokeText(
                txtScore,
                this.width / 2 - tmScore.width / 2,
                this.heigtht / 2 + 50
            );
        }

        // Request frame
        window.requestAnimationFrame(this.Render.bind(this));
    }
}

// Class of 2D Vector
class Vector2 {
    // Fields
    public x: number;
    public y: number;

    // Constructor
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    // Methods
    // Inner product
    public static Dot(a: Vector2, b: Vector2): number {
        return a.x * b.x + a.y * b.y;
    }

    // Normal vector
    public static Normal(a: Vector2): Vector2 {
        return new Vector2(a.y, a.x * -1);
    }

    // Vector substraction
    public static Minus(a: Vector2, b: Vector2): Vector2 {
        return new Vector2(a.x - b.x, a.y - b.y);
    }
}

// Class of Polygon
// It is used to collision detection
class Polygon {
    // Fields
    public vertices: Array<Vector2>;

    // Constructor
    constructor(vertices: Array<Vector2>) {
        this.vertices = vertices;
    }

    // Methods
    // Create a list of normal vectors for each edge
    private static getAxes(a: Polygon, b: Polygon): Array<Vector2> {
        let axes = new Array<Vector2>();

        for (let i = 0; i < a.vertices.length; i++) {
            let p1 = a.vertices[i];
            let p2 =
                i == a.vertices.length - 1 ? a.vertices[0] : a.vertices[i + 1];
            axes.push(Vector2.Normal(Vector2.Minus(p2, p1)));
        }

        for (let i = 0; i < b.vertices.length; i++) {
            let p1 = b.vertices[i];
            let p2 =
                i == b.vertices.length - 1 ? b.vertices[0] : b.vertices[i + 1];
            axes.push(Vector2.Normal(Vector2.Minus(p2, p1)));
        }
        return axes;
    }

    // Calculate the projection of a polygon to a straight line
    private Projection(axis: Vector2): Array<number> {
        let min = Vector2.Dot(axis, this.vertices[0]);
        let max = min;

        for (let i = 0; i < this.vertices.length; i++) {
            let p = Vector2.Dot(axis, this.vertices[i]);
            if (p < min) {
                min = p;
            } else if (p > max) {
                max = p;
            }
        }
        return [min, max];
    }

    // Returns whether two polygons collide
    public static Collide(a: Polygon, b: Polygon): boolean {
        // List of axes
        let axes = this.getAxes(a, b);

        for (let i = 0; i < axes.length; i++) {
            let ap = a.Projection(axes[i]);
            let bp = b.Projection(axes[i]);

            if (
                !(
                    // If the projections do not overlap, it is not a hit.
                    (
                        (ap[0] <= bp[0] && bp[0] <= ap[1]) ||
                        (bp[0] <= ap[0] && ap[0] <= bp[1])
                    )
                )
            ) {
                return false;
            }
        }
        return true;
    }
}

// Class of enemy aircraft
class Enemy implements Object {
    // Fields
    public alive: boolean;
    private speed: number;
    private hSpeed: number;

    private aspect: number;
    private w: number;
    private h: number;

    public x: number;
    public y: number;

    public angle: number;

    // Constructor
    constructor(scene: GameScene) {
        this.alive = true;
        this.speed = 0;
        this.hSpeed = 0;

        this.aspect = 3.036;
        this.w = 100;
        this.h = this.w / this.aspect;

        this.x = scene.Width - this.w / 2;
        this.y = scene.Height / 2;

        this.angle = 0;

        this.SetStartPosition(scene);
    }

    // Methods
    // Set start position of enemy aricraft
    public SetStartPosition(scene: GameScene): void {
        this.x = this.w / 2 + scene.Width + (Math.random() * scene.Width) / 2;
        this.y = this.h / 2 + Math.random() * (scene.Height - this.h);
        this.speed = Math.random() * 3 + 4;

        if (0.5 > Math.random()) {
            let dx = this.x - scene.Me.x + 300;
            let dy = this.y - scene.Me.y;

            this.angle = Math.atan2(dy, dx);

            this.hSpeed = this.speed * (dy / dx);
        } else {
            this.hSpeed = 0;
        }
    }

    // Move enemy aircraft
    public Move(scene: GameScene): void {
        this.x -= this.speed;
        this.y -= this.hSpeed;

        if (this.x + this.w / 2 < 0) {
            this.SetStartPosition(scene);
        }
    }

    // Render enemy aircraft
    public Render(scene: GameScene): void {
        // Rotate and draw
        scene.Context.save();
        scene.Context.translate(this.x, this.y);
        scene.Context.rotate(this.angle);

        scene.Context.drawImage(
            scene.Img_Enemy,
            -this.w / 2,
            -this.h / 2,
            this.w,
            this.h
        );

        scene.Context.restore();
    }

    // Get apolygon of enemy aircraft
    public GetPolygon(): Polygon {
        const vertices = [
            new Vector2(this.x - this.w * 0.5, this.y - this.h * 0.5),
            new Vector2(this.x + this.w * 0.5, this.y - this.h * 0.5),
            new Vector2(this.x + this.w * 0.5, this.y + this.h * 0.5),
            new Vector2(this.x - this.w * 0.5, this.y + this.h * 0.5),
        ];

        let vertices_roteted = [];

        vertices.forEach((vector) => {
            // Convert coordinates to center on (0, 0)
            let x0 = vector.x - this.x;
            let y0 = vector.y - this.y;

            // Rotate
            let x1 = x0 * Math.cos(this.angle) - y0 * Math.sin(this.angle);
            let y1 = x0 * Math.sin(this.angle) + y0 * Math.cos(this.angle);

            // Restore potision
            let x2 = x1 + this.x;
            let y2 = y1 + this.y;

            vertices_roteted.push(new Vector2(x2, y2));
        });

        return new Polygon(vertices_roteted);
    }

    // Collision detection
    public IsHit(shot: Shot): boolean {
        // If the shot is not alive, return false
        if (!shot.live) {
            return false;
        }

        // Get a vector of bullet
        let vertices = [new Vector2(shot.x, shot.y)];
        // Collision detection
        if (Polygon.Collide(this.GetPolygon(), new Polygon(vertices))) {
            return true;
        }

        return false;
    }
}

// Class of player's aircraft
class Me implements Object {
    // Fields
    public alive: boolean;

    private aspect: number;
    private w: number;
    private h: number;

    public x: number;
    public y: number;

    public upFlag: boolean;
    public downFlag: boolean;
    public forwardFlag: boolean;
    public backFlag: boolean;

    private speed: number;
    private slowSpeed: number;
    public slowFlag: boolean;

    // Properties
    public get Width(): number {
        return this.w;
    }

    public get Height(): number {
        return this.h;
    }

    // Constructor
    constructor(scene: GameScene) {
        this.alive = true;

        this.aspect = 2.048;
        this.w = 100;
        this.h = this.w / this.aspect;

        this.x = this.w / 2;
        this.y = scene.Height / 2;

        this.upFlag = false;
        this.downFlag = false;

        this.speed = 5;
        this.slowSpeed = 3;
        this.slowFlag = false;
    }

    // Methods
    // Move player's aircraft
    public Move(scene: GameScene) {
        if (this.upFlag && this.y - this.h / 2 >= 0) {
            if (this.slowFlag) {
                this.y -= this.slowSpeed;
            } else {
                this.y -= this.speed;
            }
        } else if (this.downFlag && this.y + this.h / 2 <= scene.Height) {
            if (this.slowFlag) {
                this.y += this.slowSpeed;
            } else {
                this.y += this.speed;
            }
        } else if (this.forwardFlag && this.x + this.w / 2 <= scene.Width) {
            if (this.slowFlag) {
                this.x += this.slowSpeed;
            } else {
                this.x += this.speed;
            }
        } else if (this.backFlag && this.x - this.w / 2 >= 0) {
            if (this.slowFlag) {
                this.x -= this.slowSpeed;
            } else {
                this.x -= this.speed;
            }
        }
    }

    // Render player's aircraft
    public Render(scene: GameScene): void {
        scene.Context.drawImage(
            scene.Img_Me,
            this.x - this.w / 2,
            this.y - this.h / 2,
            this.w,
            this.h
        );
    }

    // Get apolygon of player's aircraft
    private GetPolygon(): Polygon {
        // Make the hitbox size smaller than the image size
        const vertices = [
            new Vector2(this.x - this.w * 0.3, this.y - this.h * 0.3),
            new Vector2(this.x + this.w * 0.3, this.y - this.h * 0.3),
            new Vector2(this.x + this.w * 0.3, this.y + this.h * 0.3),
            new Vector2(this.x - this.w * 0.3, this.y + this.h * 0.3),
        ];

        return new Polygon(vertices);
    }

    // Collision detection
    public IsHit(enemy: Enemy): boolean {
        if (Polygon.Collide(this.GetPolygon(), enemy.GetPolygon())) {
            return true;
        }
        return false;
    }
}

// Class of shots of player's aircraft
class Shot implements Object {
    // Fields
    public live: boolean;

    private w: number;
    private h: number;

    public x: number;
    public y: number;

    // Constructor
    constructor(scene: GameScene) {
        this.live = true;
        this.w = 10;
        this.h = 10;

        this.x = 100;
        this.y = scene.Height / 2;
    }

    // Methods
    // Move bullets
    public Move(scene: GameScene): void {
        this.x += 10;

        if (this.x > scene.Width + this.w) {
            this.live = false;
        }
    }

    // Render bullets
    public Render(scene: GameScene): void {
        if (!this.live) return;

        // Get context
        const ctx = scene.Context;

        // Begin a new path
        ctx.beginPath();

        // Set gradation
        const grd = ctx.createRadialGradient(
            this.x,
            this.y,
            0,
            this.x,
            this.y,
            this.w / 2
        );
        grd.addColorStop(0, "white");
        grd.addColorStop(1, "orange");
        ctx.fillStyle = grd;

        // Draw the bullet
        ctx.arc(this.x, this.y, this.w / 2, 0, Math.PI * 2, true);
        ctx.fill();
    }
}

window.onload = () => {
    // Get canvas element
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    // Create a game class instance
    const scene = new GameScene(canvas);
    // Render screen
    scene.Render();
};
