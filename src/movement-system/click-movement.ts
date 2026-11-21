class ClickMovement extends Movement {
    public targetPosition: pc.Vec3 = new pc.Vec3();
    public hasTarget: boolean = false;
    public isMoving: boolean = false;
    public stoppingDistance: number = 0.05; // Lebih presisi saat klik jarak dekat
    public rotateTowardsTarget: boolean = true;
    public turnSpeed: number = 15;
    public speed: number = 5;
    public modelRotationOffset: number = 0;

    // Scratch vector dan quaternion agar bebas Garbage Collection setiap frame
    private nextPosition: pc.Vec3 = new pc.Vec3();
    private moveDirection: pc.Vec3 = new pc.Vec3();
    private targetRotation: pc.Quat = new pc.Quat();
    private currentRotation: pc.Quat = new pc.Quat();

    constructor(targetEntity: pc.Entity) {
        super(targetEntity);
    }

    /**
     * Mengatur posisi target tujuan baru
     * @param target Titik tujuan di dunia 3D (pc.Vec3)
     */
    public setTarget(target: pc.Vec3): void {
        this.targetPosition.copy(target);
        // Samakan Y dengan posisi entity agar tidak terbang/menembus tanah
        this.targetPosition.y = this.entity.getPosition().y;
        this.hasTarget = true;
    }

    /**
     * Menghentikan pergerakan seketika
     */
    public stop(): void {
        this.hasTarget = false;
        this.isMoving = false;
        if (this.entity.rigidbody) {
            this.entity.rigidbody.linearVelocity = pc.Vec3.ZERO;
        }
    }

    /**
     * Menggerakkan karakter menuju target menggunakan MoveToward
     * @param targetOrVelocity Titik tujuan (pc.Vec3) atau arah/kecepatan
     * @param dt Delta time per frame
     */
    public doMove(targetOrVelocity: pc.Vec3, dt: number = 0.016): void {
        // Jika parameter target diberikan dan berbeda dari target saat ini
        if (targetOrVelocity && targetOrVelocity.lengthSq() > 0) {
            if (this.targetPosition.distance(targetOrVelocity) > 0.01) {
                this.setTarget(targetOrVelocity);
            }
        }

        if (!this.hasTarget) {
            this.isMoving = false;
            return;
        }

        const currentPos = this.entity.getPosition();

        // 1. Periksa jarak horizontal (XZ) ke target
        const dx = currentPos.x - this.targetPosition.x;
        const dz = currentPos.z - this.targetPosition.z;
        const distSq = dx * dx + dz * dz;

        if (distSq <= this.stoppingDistance * this.stoppingDistance) {
            this.stop();
            return;
        }

        this.isMoving = true;

        // 2. Putar karakter menghadap ke arah target dengan modelRotationOffset yang benar
        if (this.rotateTowardsTarget) {
            this.moveDirection.sub2(this.targetPosition, currentPos);
            this.moveDirection.y = 0;

            if (this.moveDirection.lengthSq() > 0.0001) {
                this.moveDirection.normalize();
                
                // Menghitung sudut hadap (-x, -z) sesuai koordinat PlayCanvas + offset model
                const offset = this.modelRotationOffset || 0;
                const targetAngle = Math.atan2(-this.moveDirection.x, -this.moveDirection.z) * pc.math.RAD_TO_DEG + offset;
                this.targetRotation.setFromEulerAngles(0, targetAngle, 0);

                const rotFactor = pc.math.clamp(this.turnSpeed * dt, 0, 1);
                this.currentRotation.copy(this.entity.getRotation());
                this.currentRotation.slerp(this.currentRotation, this.targetRotation, rotFactor);
                this.entity.setRotation(this.currentRotation);
            }
        }

        // 3. Hitung perpindahan posisi menggunakan MoveToward.move
        const maxDelta = this.speed * dt;
        MoveToward.move(currentPos, this.targetPosition, maxDelta, this.nextPosition);

        // Ketinggian Y dipertahankan dari posisi awal entity
        this.nextPosition.y = currentPos.y;

        // 4. Update posisi ke Entity / Rigidbody
        if (this.entity.rigidbody) {
            this.entity.rigidbody.teleport(this.nextPosition);
        } else {
            this.entity.setPosition(this.nextPosition);
        }
    }
}
