class ClickInput implements IInput {
    value: pc.Vec3;
    targetPosition: pc.Vec3;
    hasTarget: boolean = false;
    disabled: boolean = false;
    app: pc.AppBase;
    cameraEntity?: pc.Entity;
    ignoreEntity?: pc.Entity;

    // Scratch vector untuk kalkulasi raycast tanpa alokasi GC setiap klik
    private rayStart: pc.Vec3 = new pc.Vec3();
    private rayEnd: pc.Vec3 = new pc.Vec3();

    constructor(app: pc.AppBase, cameraEntity?: pc.Entity, ignoreEntity?: pc.Entity) {
        this.app = app;
        this.cameraEntity = cameraEntity;
        this.ignoreEntity = ignoreEntity;
        this.value = new pc.Vec3();
        this.targetPosition = new pc.Vec3();
        this.bindEvents();
    }

    private bindEvents(): void {
        this.app.mouse?.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        this.app.touch?.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
    }

    private onMouseDown(event: pc.MouseEvent): void {
        if (event.button === pc.MOUSEBUTTON_LEFT) {
            this.handlePointerDown(event.x, event.y);
        }
    }

    private onTouchStart(event: pc.TouchEvent): void {
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            this.handlePointerDown(touch.x, touch.y);
        }
    }

    /**
     * Memproses posisi layar (X, Y) menjadi posisi 3D di dunia menggunakan Raycast
     */
    private handlePointerDown(screenX: number, screenY: number): void {
        if (this.disabled) return;

        const camera = this.getCamera();
        if (!camera || !camera.camera) {
            console.warn("[ClickInput] Kamera tidak ditemukan untuk melakukan raycast.");
            return;
        }

        // 1. Mengubah koordinat layar menjadi titik awal (nearClip) dan titik akhir (farClip)
        camera.camera.screenToWorld(screenX, screenY, camera.camera.nearClip, this.rayStart);
        camera.camera.screenToWorld(screenX, screenY, camera.camera.farClip, this.rayEnd);

        let hitFound = false;

        // 2. Raycast ke Physics Rigidbody di dalam scene dengan FILTERING agar tidak mengenai badan Player sendiri
        const rbSystem = this.app.systems.rigidbody;
        if (rbSystem) {
            const result = rbSystem.raycastFirst(this.rayStart, this.rayEnd, {
                filterCallback: (entity: pc.Entity) => {
                    // Abaikan entity player sendiri atau turunannya agar raycast tembus ke lantai di bawahnya
                    if (this.ignoreEntity) {
                        if (entity === this.ignoreEntity || entity.isDescendantOf(this.ignoreEntity)) {
                            return false;
                        }
                    }
                    if (entity.tags && entity.tags.has('player')) {
                        return false;
                    }
                    return true;
                }
            });

            if (result) {
                this.targetPosition.copy(result.point);
                hitFound = true;
            }
        }

        // 3. Fallback: Jika tidak mengenai collider physics, intersect dengan bidang lantai setinggi kaki player
        if (!hitFound) {
            const groundY = this.ignoreEntity ? this.ignoreEntity.getPosition().y : 0;
            hitFound = this.intersectGroundPlane(this.rayStart, this.rayEnd, groundY, this.targetPosition);
        }

        if (hitFound) {
            this.hasTarget = true;
            this.value.copy(this.targetPosition);

            // Tembakkan event global jika ada sistem lain yang ingin mendengarkan klik
            this.app.fire("input:clickTarget", this.targetPosition);
        }
    }

    /**
     * Menghitung titik potong Ray dengan bidang datar (Plane Y = groundY)
     */
    private intersectGroundPlane(start: pc.Vec3, end: pc.Vec3, groundY: number, out: pc.Vec3): boolean {
        const deltaY = end.y - start.y;
        if (Math.abs(deltaY) < 0.00001) return false;

        const t = (groundY - start.y) / deltaY;
        if (t < 0 || t > 1) return false;

        out.lerp(start, end, t);
        return true;
    }

    private getCamera(): pc.Entity | null {
        if (this.cameraEntity) return this.cameraEntity;

        // Cari kamera bernama 'Camera' di root scene
        const cam = this.app.root.findByName('Camera') as pc.Entity;
        if (cam) return cam;

        // Atau cari dari sistem kamera PlayCanvas
        const cameras = (this.app.systems as any).camera?.cameras;
        return cameras && cameras[0] ? cameras[0].entity : null;
    }

    public setDisabled(disabled: boolean): void {
        this.disabled = disabled;
        if (disabled) {
            this.clearTarget();
        }
    }

    public clearTarget(): void {
        this.hasTarget = false;
        this.value.set(0, 0, 0);
    }

    public destroy(): void {
        this.app.mouse?.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        this.app.touch?.off(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
    }
}
