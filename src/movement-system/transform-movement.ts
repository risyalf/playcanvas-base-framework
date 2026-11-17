class TransformMovement extends Movement {
    // Siapkan 1 variabel penampung agar bebas Garbage Collector 
    private moveOffset = new pc.Vec3();
    private currentVelocity = new pc.Vec3();
    private acceleration: number = 4;
    private deceleration: number = 8;

    constructor(targetEntity: pc.Entity) {
        super(targetEntity);
    }

    /**                                                                                                                             
     * Menggerakkan entity secara langsung (Non-Fisika)
     * @param direction Arah dan kecepatan gerak (Direction * Speed)
     * @param dt Delta time dari update (waktu antar frame dalam detik)
     */
    doMove(direction: pc.Vec3, dt: number = 0.016): void {
        const isMoving = direction.lengthSq() > 0;

        const rate = isMoving ? this.acceleration : this.deceleration;

        const factor = pc.math.clamp(rate * dt, 0, 1);
        this.currentVelocity.lerp(this.currentVelocity, direction, factor);

        if (!isMoving && this.currentVelocity.lengthSq() < 0.0001) {
            this.currentVelocity.set(0, 0, 0);
            return;
        }

        // 1. Hitung jarak geser frame ini: Direction * dt
        this.moveOffset.copy(this.currentVelocity).mulScalar(dt);
        // 2. Geser posisi entity di dunia 3D!
        this.entity.translate(this.moveOffset);
    }
}