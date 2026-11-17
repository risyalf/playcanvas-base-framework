class PlayerMovement extends pc.ScriptType {
    movement: IMovement;
    speed: IStat;
    input: IInput;
    baseValueSpeed: number;
    direction: pc.Vec3;

    initialize() {
        // this.movement = new PhysicsMovement(this.entity) as IMovement;
        this.movement = new TransformMovement(this.entity) as IMovement;
        this.speed = new Stat(this.baseValueSpeed) as IStat;
        this.input = new InputKeyboard(this.app);
        this.direction = new pc.Vec3();

        this.on('destroy', () => {
            this.input.destroy();
        });
    }

    update(dt: number) {
        const moveSpeed = this.speed.value;

        // Ambil input arah dari sistem input
        this.direction.copy(this.input.value);

        // Jika ada input arah
        if (this.direction.lengthSq() > 0) {
            this.direction.mulScalar(moveSpeed);

            // Apply rotation to the force vector (45 degrees isometric angle)
            const angle = -Math.PI * 0.25;  // 45 degrees in radians
            const rx = Math.cos(angle);
            const rz = Math.sin(angle);
            const rotatedX = this.direction.x * rx - this.direction.z * rz;
            const rotatedZ = this.direction.z * rx + this.direction.x * rz;

            this.direction.set(rotatedX, 0, rotatedZ);
        }

        this.movement.doMove(this.direction, dt);
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