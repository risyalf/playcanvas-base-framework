interface IStat {
    baseValue: number;
    value: number;
    addModifier(modifier: IModifier): void;
    removeModifier(modifier: IModifier): void;
}

class Stat implements IStat {
    baseValue: number;
    private modifiers: IModifier[] = [];

    constructor(baseValue: number = 0) {
        this.baseValue = baseValue;
    }

    get value(): number {
        let additional = 0;
        let multiplier = 1;

        for (const mod of this.modifiers) {
            if (mod.type === ModifierType.ADDITIONAL) {
                additional += mod.value;
            } else if (mod.type === ModifierType.MULTIPLIER) {
                multiplier += mod.value;
            }
        }

        return (this.baseValue + additional) * multiplier;
    }

    addModifier(modifier: IModifier): void {
        this.modifiers.push(modifier);
    }

    removeModifier(modifier: IModifier): void {
        const index = this.modifiers.indexOf(modifier);
        if (index >= 0) {
            this.modifiers.
                splice(index, 1);
        }
    }
}

class MoveSpeed extends Stat {
    constructor(baseValue: number = 0) {
        super(baseValue);
    }
}