interface IInput {
    value: pc.Vec3;
    disabled: boolean;
    setDisabled(disabled: boolean): void;
    destroy(): void;
}
