class TransformMovement extends Movement {
    // Siapkan 1 variabel penampung agar bebas Garbage Collector 
    private moveOffset = new pc.Vec3();

    constructor(targetEntity: pc.Entity) {
        super(targetEntity);
    }

    /**                                                                                                                             
     * Menggerakkan entity secara langsung (Non-Fisika)
     * @param direction Arah dan kecepatan gerak (Direction * Speed)
     * @param dt Delta time dari update (waktu antar frame dalam detik)
     */
    doMove(direction: pc.Vec3, dt: number = 0.016): void {
        if (direction.lengthSq() === 0) return;

        // 1. Hitung jarak geser frame ini: Direction * dt
        this.moveOffset.copy(direction).mulScalar(dt);

        // 2. Geser posisi entity di dunia 3D!                                                                                      
        this.entity.translate(this.moveOffset);

        // (Atau gunakan this.entity.translateLocal(...) jika ingin gerak relatif arah hadap objek)
    }
}