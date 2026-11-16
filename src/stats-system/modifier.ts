enum ModifierType {
    ADDITIONAL,
    MULTIPLIER
}

interface IModifier {
    value: number;
    type: ModifierType;
}