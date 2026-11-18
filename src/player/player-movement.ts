class PlayerMovement extends pc.ScriptType {
    movement: IMovement;
    speed: IStat;
    input: IInput;
    baseValueSpeed: number;
    movementType: number;
    direction: pc.Vec3;

    // Attribute konfigurasi
    controlMode: number;
    cameraEntity: pc.Entity;
    sprintMultiplier: number;
    rotationSpeed: number;
    turnSpeed: number;
    modelRotationOffset: number;
    isometricMode: boolean;
    idleAnim: string;
    runAnim: string;

    private currentRotation: pc.Quat;
    private targetRotation: pc.Quat;
    private moveDirection: pc.Vec3;
    private camForward: pc.Vec3;
    private camRight: pc.Vec3;
    private currentAnim: string;

    initialize() {
        this.movement = this.movementType === 1 ? new PhysicsMovement(this.entity) : new TransformMovement(this.entity);
        this.speed = new Stat(this.baseValueSpeed) as IStat;
        this.input = new InputKeyboard(this.app);
        this.direction = new pc.Vec3();

        this.currentRotation = new pc.Quat();
        this.targetRotation = new pc.Quat();
        this.moveDirection = new pc.Vec3();
        this.camForward = new pc.Vec3();
        this.camRight = new pc.Vec3();
        this.currentAnim = '';

        // Otomatis cari kamera di scene jika belum di-assign
        if (!this.cameraEntity) {
            this.cameraEntity = this.app.root.findByName('Camera') as pc.Entity;
            if (!this.cameraEntity && (this.app.systems as any).camera?.cameras?.[0]) {
                this.cameraEntity = (this.app.systems as any).camera.cameras[0].entity;
            }
        }

        // Inisialisasi animasi default (Idle) jika menggunakan komponen Animation legacy
        if (this.entity.animation) {
            this.currentAnim = this.idleAnim;
            this.entity.animation.play(this.idleAnim, 0.2);
            this.entity.animation.loop = true;
        }

        this.on('destroy', () => {
            this.input.destroy();
        });

        this.entity.collision?.on('collisionstart', this.onCollisionStart, this);
        this.entity.collision?.on('collisionend', this.onCollisionEnd, this);
    }

    update(dt: number) {
        let moveSpeed = this.speed.value;

        // Shift untuk lari cepat (Sprint seperti Genshin Impact)
        const isSprinting = !!this.app.keyboard?.isPressed(pc.KEY_SHIFT);
        if (isSprinting) {
            moveSpeed *= this.sprintMultiplier;
        }

        if (this.controlMode === 0) {
            // ==============================================================
            // Mode 0: Genshin Impact Style (Camera-Relative Movement)
            // W = Menuju arah pandang kamera
            // S = Mundur dari pandangan kamera
            // A/D = Bergerak ke kiri/kanan pandangan kamera
            // Karakter berputar mulus menghadap arah gerakan.
            // Kamera bebas berputar 360 derajat mengelilingi karakter saat diam.
            // ==============================================================
            const inputX = this.input.value.x; // A: -1, D: +1
            const inputZ = this.input.value.z; // W: -1, S: +1

            const cam = this.cameraEntity;
            if (cam) {
                // Ambil vektor forward dan right dari kamera pada bidang horizontal (XZ)
                this.camForward.copy(cam.forward);
                this.camForward.y = 0;
                this.camForward.normalize();

                this.camRight.copy(cam.right);
                this.camRight.y = 0;
                this.camRight.normalize();

                // Hitung arah gerak relatif terhadap kamera (Bebas Garbage Collector)
                this.moveDirection.set(
                    this.camRight.x * inputX + this.camForward.x * (-inputZ),
                    0,
                    this.camRight.z * inputX + this.camForward.z * (-inputZ)
                );
            } else {
                this.moveDirection.set(inputX, 0, inputZ);
            }

            const isMoving = this.moveDirection.lengthSq() > 0;

            if (isMoving) {
                this.moveDirection.normalize();

                // 1. Karakter berputar mulus menghadap arah pergerakan
                const offset = this.modelRotationOffset || 0;
                const targetAngle = Math.atan2(-this.moveDirection.x, -this.moveDirection.z) * pc.math.RAD_TO_DEG + offset;
                this.targetRotation.setFromEulerAngles(0, targetAngle, 0);

                const rotFactor = pc.math.clamp(this.rotationSpeed * dt, 0, 1);
                this.currentRotation.copy(this.entity.getRotation());
                this.currentRotation.slerp(this.currentRotation, this.targetRotation, rotFactor);

                if (this.entity.rigidbody && this.movementType === 1) {
                    this.entity.rigidbody.teleport(this.entity.getPosition(), this.currentRotation);
                } else {
                    this.entity.setRotation(this.currentRotation);
                }

                // 2. Berikan kecepatan ke arah gerakan
                this.direction.copy(this.moveDirection).mulScalar(moveSpeed);
            } else {
                this.direction.set(0, 0, 0);
            }

            this.movement.doMove(this.direction, dt);
            this.updateAnimation(isMoving, moveSpeed);

        } else if (this.controlMode === 1) {
            // ==============================================================
            // Mode 1: Tank / Turn Controls (A/D Rotasi, W/S Maju-Mundur)
            // ==============================================================
            const turnInput = this.input.value.x;
            const moveInput = -this.input.value.z;

            if (Math.abs(turnInput) > 0) {
                const turnAngle = -turnInput * this.turnSpeed * dt;
                this.entity.rotate(0, turnAngle, 0);

                if (this.entity.rigidbody && this.movementType === 1) {
                    this.entity.rigidbody.teleport(this.entity.getPosition(), this.entity.getRotation());
                }
            }

            if (Math.abs(moveInput) > 0) {
                this.direction.copy(this.entity.forward).mulScalar(moveInput * moveSpeed);
            } else {
                this.direction.set(0, 0, 0);
            }

            this.movement.doMove(this.direction, dt);
            this.updateAnimation(Math.abs(moveInput) > 0, moveSpeed);

        } else {
            // ==============================================================
            // Mode 2: Free Strafe (Sumbu Dunia)
            // ==============================================================
            this.direction.copy(this.input.value);
            const isMoving = this.direction.lengthSq() > 0;

            if (isMoving) {
                this.direction.mulScalar(moveSpeed);

                if (this.isometricMode) {
                    const angle = -Math.PI * 0.25;
                    const rx = Math.cos(angle);
                    const rz = Math.sin(angle);
                    const rotatedX = this.direction.x * rx - this.direction.z * rz;
                    const rotatedZ = this.direction.z * rx + this.direction.x * rz;
                    this.direction.set(rotatedX, 0, rotatedZ);
                }

                const offset = this.modelRotationOffset || 0;
                const targetAngle = Math.atan2(-this.direction.x, -this.direction.z) * pc.math.RAD_TO_DEG + offset;
                this.targetRotation.setFromEulerAngles(0, targetAngle, 0);

                const rotFactor = pc.math.clamp(this.rotationSpeed * dt, 0, 1);
                this.currentRotation.copy(this.entity.getRotation());
                this.currentRotation.slerp(this.currentRotation, this.targetRotation, rotFactor);

                if (this.entity.rigidbody && this.movementType === 1) {
                    this.entity.rigidbody.teleport(this.entity.getPosition(), this.currentRotation);
                } else {
                    this.entity.setRotation(this.currentRotation);
                }
            }

            this.movement.doMove(this.direction, dt);
            this.updateAnimation(isMoving, moveSpeed);
        }
    }

    private updateAnimation(isMoving: boolean, currentSpeed: number) {
        const targetAnim = isMoving ? this.runAnim : this.idleAnim;

        // 1. Dukungan untuk Anim Component modern (Anim State Graph)
        if (this.entity.anim) {
            this.entity.anim.setBoolean('isMoving', isMoving);
            this.entity.anim.setFloat('speed', isMoving ? currentSpeed : 0);
        }

        // 2. Dukungan untuk Animation Component legacy
        if (this.entity.animation) {
            if (this.currentAnim !== targetAnim) {
                this.currentAnim = targetAnim;
                this.entity.animation.play(targetAnim, 0.2);
            }
        }
    }

    onCollisionStart = function (result: pc.ContactResult) {
        
    };

    onCollisionEnd = function (result: pc.ContactResult) {
        
    }; 

    destroy() {
        this.entity.collision?.off(
            'collisionstart',
            this.onCollisionStart,
            this
        );

        this.entity.collision?.off(
            'collisionend',
            this.onCollisionEnd,
            this
        );

        console.log('Player destroyed');
    }
}

pc.registerScript(PlayerMovement, "playerMovement");

PlayerMovement.attributes.add("controlMode", {
    type: 'number',
    default: 0,
    enum: [
        { 'Genshin Impact (Camera-Relative)': 0 },
        { 'Turn/Tank (A/D Rotasi, W/S Maju-Mundur)': 1 },
        { 'Free Strafe (Sumbu Dunia)': 2 }
    ],
    title: "Control Mode",
    description: "Pilih gaya kontrol pergerakan karakter"
});

PlayerMovement.attributes.add("cameraEntity", {
    type: 'entity',
    title: "Camera Entity",
    description: "Kamera yang menjadi patokan arah gerak (kosongkan jika otomatis cari 'Camera')"
});

PlayerMovement.attributes.add("baseValueSpeed", {
    type: 'number',
    default: 2.5,
    min: 0.5,
    max: 20,
    precision: 2,
    description: "Kecepatan jalan normal karakter"
});

PlayerMovement.attributes.add("sprintMultiplier", {
    type: 'number',
    default: 1.8,
    min: 1.0,
    max: 3.0,
    precision: 2,
    title: "Sprint Multiplier",
    description: "Pengali kecepatan saat menahan tombol Shift"
});

PlayerMovement.attributes.add("rotationSpeed", {
    type: 'number',
    default: 15,
    min: 1,
    max: 40,
    title: "Rotation Speed",
    description: "Kecepatan karakter berputar menghadap arah jalan"
});

PlayerMovement.attributes.add("modelRotationOffset", {
    type: 'number',
    default: 180,
    title: "Model Rotation Offset",
    description: "Offset sudut hadap model (180 jika model menghadap ke belakang/kamera, 0 jika normal)"
});

PlayerMovement.attributes.add("turnSpeed", {
    type: 'number',
    default: 130,
    min: 30,
    max: 360,
    title: "Turn Speed (Mode Tank)",
    description: "Kecepatan rotasi belok di tempat saat Mode Tank"
});

PlayerMovement.attributes.add("movementType", {
    type: 'number',
    default: 0,
    enum: [
        { 'Transform': 0 },
        { 'Physics': 1 }
    ]
});

PlayerMovement.attributes.add("isometricMode", {
    type: 'boolean',
    default: false,
    title: "Isometric Mode",
    description: "Centang hanya jika menggunakan kamera isometrik 45 derajat"
});

PlayerMovement.attributes.add("idleAnim", {
    type: 'string',
    default: 'idle',
    title: "Idle Anim Name",
    description: "Nama animasi saat diam (idle)"
});

PlayerMovement.attributes.add("runAnim", {
    type: 'string',
    default: 'run',
    title: "Run/Walk Anim Name",
    description: "Nama animasi saat berjalan/berlari"
});
