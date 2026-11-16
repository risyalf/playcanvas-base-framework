class PlayerMovement extends pc.ScriptType {
    movement: IMovement;
    speed: IStat;
    baseValueSpeed: number
    direction: pc.Vec3;

    initialize() {
        // this.movement = new PhysicsMovement(this.entity) as IMovement;
        this.movement = new TransformMovement(this.entity) as IMovement;
        this.speed = new Stat(this.baseValueSpeed) as IStat;
        this.direction = new pc.Vec3;
    }

    update(dt: number) {
        const keyboard = this.app.keyboard;
        if (!keyboard) return;

        const moveSpeed = this.speed.value;
        let forceX = 0;
        let forceZ = 0;

        // Calculate force based on pressed keys
        if (keyboard.isPressed(pc.KEY_LEFT) || keyboard.isPressed(pc.KEY_A)) {
            forceX = -moveSpeed;
        }

        if (keyboard.isPressed(pc.KEY_RIGHT) || keyboard.isPressed(pc.KEY_D)) {
            forceX += moveSpeed;
        }

        if (keyboard.isPressed(pc.KEY_UP) || keyboard.isPressed(pc.KEY_W)) {
            forceZ = -moveSpeed;
        }

        if (keyboard.isPressed(pc.KEY_DOWN) || keyboard.isPressed(pc.KEY_S)) {
            forceZ += moveSpeed;
        }

        this.direction.set(forceX, 0, forceZ);

        // If we have some non-zero force
        if (this.direction.lengthSq() > 0) {
            // Normalize the force vector
            this.direction.normalize().mulScalar(moveSpeed);

            // Apply rotation to the force vector (45 degrees isometric angle)
            const angle = -Math.PI * 0.25;  // 45 degrees in radians
            const rx = Math.cos(angle);
            const rz = Math.sin(angle);
            const rotatedX = this.direction.x * rx - this.direction.z * rz;
            const rotatedZ = this.direction.z * rx + this.direction.x * rz;

            this.direction.set(rotatedX, 0, rotatedZ);
        }

        this.movement.doMove(this.direction);
    }
}

pc.registerScript(PlayerMovement, "playerMovement");

PlayerMovement.attributes.add("baseValueSpeed", {
    type: 'number',
    default: 1,
    min: 0.05,
    max: 5,
    precision: 2,
    description: "Control the speed movement of entity"
});