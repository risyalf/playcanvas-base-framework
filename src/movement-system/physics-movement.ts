class PhysicsMovement extends Movement {
    constructor(targetEntity: pc.Entity) {
        super(targetEntity);
    }

    doMove(direction: pc.Vec3): void {
        this.entity.rigidbody?.applyImpulse(direction);
    }
}