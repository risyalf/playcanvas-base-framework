class FollowCamera extends pc.ScriptType {
    target: pc.Entity;
    distance: number;
    minDistance: number;
    maxDistance: number;
    pitchMin: number;
    pitchMax: number;
    focusHeight: number;
    sensitivity: number;
    touchSensitivity: number;
    smoothSpeed: number;
    pointerLockOnClick: boolean;

    private targetYaw: number;
    private targetPitch: number;
    private targetDistance: number;

    private currentYaw: number;
    private currentPitch: number;
    private currentDistance: number;

    private isMouseDown: boolean;
    private isPointerLocked: boolean;

    private focusPos: pc.Vec3;
    private camPos: pc.Vec3;
    private offset: pc.Vec3;
    private quat: pc.Quat;

    initialize() {
        this.targetDistance = this.distance || 4.5;
        this.currentDistance = this.targetDistance;
        this.targetPitch = 15;
        this.currentPitch = 15;
        this.targetYaw = 0;
        this.currentYaw = 0;

        this.isMouseDown = false;
        this.isPointerLocked = false;

        this.focusPos = new pc.Vec3();
        this.camPos = new pc.Vec3();
        this.offset = new pc.Vec3();
        this.quat = new pc.Quat();

        if (this.app.mouse) {
            this.app.mouse.disableContextMenu();
            this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
            this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
            this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
            this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);
        }

        // Dukungan Pointer Lock (seperti di game PC/Genshin Impact)
        document.addEventListener('pointerlockchange', this.onPointerLockChange);

        const canvas = this.app.graphicsDevice.canvas;
        if (canvas) {
            // Mencegah scroll dan pull-to-refresh browser agar touch kamera tidak terinterupsi
            canvas.style.touchAction = 'none';
        }

        if (this.pointerLockOnClick && canvas) {
            canvas.addEventListener('click', this.onCanvasClick);
        }

        // Pastikan TouchDevice terhubung (khususnya saat mode emulator F12 di browser desktop)
        if (!this.app.touch && canvas && (window.TouchEvent || 'ontouchstart' in window || navigator.maxTouchPoints > 0)) {
            this.app.touch = new pc.TouchDevice(canvas);
        }

        // Touch support untuk layar sentuh / mobile
        if (this.app.touch) {
            this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
            this.app.touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
            this.app.touch.on(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
            this.app.touch.on(pc.EVENT_TOUCHCANCEL, this.onTouchEnd, this);
        }

        this.on('destroy', () => {
            if (this.app.mouse) {
                this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
                this.app.mouse.off(pc.EVENT_MOUSEUP, this.onMouseUp, this);
                this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
                this.app.mouse.off(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);
            }
            if (this.app.touch) {
                this.app.touch.off(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
                this.app.touch.off(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
                this.app.touch.off(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
                this.app.touch.off(pc.EVENT_TOUCHCANCEL, this.onTouchEnd, this);
            }
            document.removeEventListener('pointerlockchange', this.onPointerLockChange);
            if (canvas) {
                canvas.removeEventListener('click', this.onCanvasClick);
            }
        });
    }

    private onCanvasClick = () => {
        if (!this.isPointerLocked && this.pointerLockOnClick) {
            this.app.graphicsDevice.canvas.requestPointerLock?.();
        }
    };

    private onPointerLockChange = () => {
        this.isPointerLocked = document.pointerLockElement === this.app.graphicsDevice.canvas;
    };

    private onMouseDown(event: pc.MouseEvent) {
        if (event.button === pc.MOUSEBUTTON_LEFT || event.button === pc.MOUSEBUTTON_RIGHT) {
            this.isMouseDown = true;
        }
    }

    private onMouseUp(event: pc.MouseEvent) {
        if (event.button === pc.MOUSEBUTTON_LEFT || event.button === pc.MOUSEBUTTON_RIGHT) {
            this.isMouseDown = false;
        }
    }

    private onMouseMove(event: pc.MouseEvent) {
        // Rotasi kamera saat mouse digeser (ketika di-drag atau saat pointer lock aktif)
        if (this.isPointerLocked || this.isMouseDown) {
            this.targetYaw -= event.dx * this.sensitivity;
            this.targetPitch += event.dy * this.sensitivity;
            this.targetPitch = pc.math.clamp(this.targetPitch, this.pitchMin, this.pitchMax);
        }
    }

    private onMouseWheel(event: pc.MouseEvent) {
        // Zoom in / zoom out kamera
        this.targetDistance -= event.wheelDelta * 0.5;
        this.targetDistance = pc.math.clamp(this.targetDistance, this.minDistance, this.maxDistance);
        event.event.preventDefault?.();
    }

    private touchStartX = 0;
    private touchStartY = 0;
    private lastPinchDistance = 0;
    private isTouching = false;

    private onTouchStart(event: pc.TouchEvent) {
        event.event?.preventDefault?.();

        if (event.touches.length === 1) {
            this.touchStartX = event.touches[0].x;
            this.touchStartY = event.touches[0].y;
            this.isTouching = true;
        } else if (event.touches.length === 2) {
            // Persiapan Pinch-to-zoom (2 jari)
            this.isTouching = false;
            const dx = event.touches[0].x - event.touches[1].x;
            const dy = event.touches[0].y - event.touches[1].y;
            this.lastPinchDistance = Math.sqrt(dx * dx + dy * dy);
        }
    }

    private onTouchMove(event: pc.TouchEvent) {
        event.event?.preventDefault?.();

        if (event.touches.length === 1 && this.isTouching) {
            // Rotasi kamera (1 jari)
            const touch = event.touches[0];
            const dx = touch.x - this.touchStartX;
            const dy = touch.y - this.touchStartY;
            this.touchStartX = touch.x;
            this.touchStartY = touch.y;

            const touchSens = this.touchSensitivity || (this.sensitivity * 1.5) || 0.3;
            this.targetYaw -= dx * touchSens;
            this.targetPitch += dy * touchSens;
            this.targetPitch = pc.math.clamp(this.targetPitch, this.pitchMin, this.pitchMax);
        } else if (event.touches.length === 2) {
            // Zoom kamera dengan 2 jari (Pinch to Zoom)
            const dx = event.touches[0].x - event.touches[1].x;
            const dy = event.touches[0].y - event.touches[1].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (this.lastPinchDistance > 0) {
                const pinchDelta = distance - this.lastPinchDistance;
                this.targetDistance -= pinchDelta * 0.015;
                this.targetDistance = pc.math.clamp(this.targetDistance, this.minDistance, this.maxDistance);
            }
            this.lastPinchDistance = distance;
        }
    }

    private onTouchEnd(event: pc.TouchEvent) {
        if (event.touches.length === 1) {
            // Jika melepas 1 jari dari 2 jari, lanjut rotasi mulus tanpa melompat
            this.touchStartX = event.touches[0].x;
            this.touchStartY = event.touches[0].y;
            this.isTouching = true;
        } else if (event.touches.length === 0) {
            this.isTouching = false;
            this.lastPinchDistance = 0;
        }
    }

    postUpdate(dt: number) {
        if (!this.target) return;

        // Interpolasi halus (lerp) pergerakan kamera
        const factor = pc.math.clamp(this.smoothSpeed * (60 * dt), 0.01, 1);
        this.currentYaw = pc.math.lerp(this.currentYaw, this.targetYaw, factor);
        this.currentPitch = pc.math.lerp(this.currentPitch, this.targetPitch, factor);
        this.currentDistance = pc.math.lerp(this.currentDistance, this.targetDistance, factor);

        // Titik fokus kamera (di sekitar dada/leher pemain)
        this.focusPos.copy(this.target.getPosition());
        this.focusPos.y += this.focusHeight;

        // Hitung posisi orbit kamera di sekeliling titik fokus
        this.quat.setFromEulerAngles(-this.currentPitch, this.currentYaw, 0);
        this.offset.set(0, 0, this.currentDistance);
        this.quat.transformVector(this.offset, this.offset);

        this.camPos.copy(this.focusPos).add(this.offset);
        this.entity.setPosition(this.camPos);
        this.entity.lookAt(this.focusPos);
    }
}

pc.registerScript(FollowCamera, "followCamera");

FollowCamera.attributes.add("target", {
    type: 'entity',
    title: 'Target',
    description: 'Entity target (karakter player) yang akan diikuti'
});

FollowCamera.attributes.add("distance", {
    type: 'number',
    default: 4.5,
    min: 1,
    max: 20,
    title: 'Distance',
    description: 'Jarak default kamera dari karakter'
});

FollowCamera.attributes.add("minDistance", {
    type: 'number',
    default: 1.5,
    min: 0.5,
    max: 10,
    title: 'Min Distance',
    description: 'Batas jarak terdekat saat zoom in'
});

FollowCamera.attributes.add("maxDistance", {
    type: 'number',
    default: 8.0,
    min: 2,
    max: 30,
    title: 'Max Distance',
    description: 'Batas jarak terjauh saat zoom out'
});

FollowCamera.attributes.add("pitchMin", {
    type: 'number',
    default: -20,
    min: -80,
    max: 0,
    title: 'Pitch Min',
    description: 'Batas sudut menengadah (melihat ke atas)'
});

FollowCamera.attributes.add("pitchMax", {
    type: 'number',
    default: 65,
    min: 10,
    max: 85,
    title: 'Pitch Max',
    description: 'Batas sudut menunduk (melihat dari atas)'
});

FollowCamera.attributes.add("focusHeight", {
    type: 'number',
    default: 1.4,
    min: 0,
    max: 5,
    title: 'Focus Height',
    description: 'Ketinggian titik pandang kamera dari poros karakter'
});

FollowCamera.attributes.add("sensitivity", {
    type: 'number',
    default: 0.2,
    min: 0.01,
    max: 1,
    precision: 2,
    title: 'Sensitivity',
    description: 'Sensitivitas putaran mouse'
});

FollowCamera.attributes.add("touchSensitivity", {
    type: 'number',
    default: 0.35,
    min: 0.05,
    max: 2,
    precision: 2,
    title: 'Touch Sensitivity',
    description: 'Sensitivitas putaran kamera saat digeser menggunakan sentuhan jari (Mobile)'
});

FollowCamera.attributes.add("smoothSpeed", {
    type: 'number',
    default: 0.15,
    min: 0.01,
    max: 1,
    precision: 2,
    title: 'Smooth Speed',
    description: 'Kehalusan kamera saat berputar (0.05 lembut, 1 seketika)'
});

FollowCamera.attributes.add("pointerLockOnClick", {
    type: 'boolean',
    default: false,
    title: 'Pointer Lock on Click',
    description: 'Jika aktif, klik di layar akan mengunci kursor (seperti game PC). Tekan ESC untuk melepas.'
});
