class InputKeyboard implements IInput {
    value: pc.Vec3;
    disabled: boolean = false;
    app: pc.AppBase;

    private keys: { [key: number]: boolean } = {};

    constructor(app: pc.AppBase) {
        this.app = app;
        this.value = new pc.Vec3();
        this.bindEvents();
    }

    private bindEvents(): void {
        const keyboard = this.app.keyboard;
        if (!keyboard) return;

        keyboard.on(pc.EVENT_KEYDOWN, this.onKeyDown, this);
        keyboard.on(pc.EVENT_KEYUP, this.onKeyUp, this);
        window.addEventListener('blur', this.onWindowBlur);
    }

    private onKeyDown(event: pc.KeyboardEvent): void {
        if (event.key != null) {
            this.keys[event.key] = true;
            this.updateValue();
        }
    }

    private onKeyUp(event: pc.KeyboardEvent): void {
        if (event.key != null) {
            this.keys[event.key] = false;
            this.updateValue();
        }
    }

    private onWindowBlur = (): void => {
        this.keys = {};
        this.updateValue();
    };

    private updateValue(): void {
        if (this.disabled) {
            this.value.set(0, 0, 0);
            return;
        }

        let x = 0;
        let z = 0;

        if (this.keys[pc.KEY_LEFT] || this.keys[pc.KEY_A]) {
            x -= 1;
        }
        if (this.keys[pc.KEY_RIGHT] || this.keys[pc.KEY_D]) {
            x += 1;
        }
        if (this.keys[pc.KEY_UP] || this.keys[pc.KEY_W]) {
            z -= 1;
        }
        if (this.keys[pc.KEY_DOWN] || this.keys[pc.KEY_S]) {
            z += 1;
        }

        this.value.set(x, 0, z);

        if (this.value.lengthSq() > 0) {
            this.value.normalize();
        }
    }

    setDisabled(disabled: boolean): void {
        this.disabled = disabled;
        if (disabled) {
            this.value.set(0, 0, 0);
        } else {
            this.updateValue();
        }
    }

    destroy(): void {
        const keyboard = this.app.keyboard;
        if (keyboard) {
            keyboard.off(pc.EVENT_KEYDOWN, this.onKeyDown, this);
            keyboard.off(pc.EVENT_KEYUP, this.onKeyUp, this);
        }
        window.removeEventListener('blur', this.onWindowBlur);
    }
}
