class PhysicsMovement extends Movement {
    private targetVelocity = new pc.Vec3();

    constructor(targetEntity: pc.Entity) {
        super(targetEntity);
        if (this.entity.rigidbody) {
            // Mencegah entity terjungkal/terguling saat menabrak obstacle
            this.entity.rigidbody.angularFactor = pc.Vec3.ZERO;
        }
    }

    doMove(direction: pc.Vec3): void {
        const rb = this.entity.rigidbody;
        if (!rb) return;

        const currentY = rb.linearVelocity.y;
        this.targetVelocity.set(direction.x, currentY, direction.z);
        rb.linearVelocity = this.targetVelocity;
    }
}