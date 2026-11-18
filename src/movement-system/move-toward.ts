class MoveToward {
    // Scratch vector static untuk mencegah alokasi memory (Garbage Collector) setiap frame
    private static readonly _toTarget = new pc.Vec3();
    private static readonly _dir = new pc.Vec3();

    // Mencegah class di-instantiate (karena ini static utility class)
    private constructor() {}

    /**
     * Menggerakkan posisi 3D `current` menuju `target` dengan jarak maksimum `maxDistanceDelta` (speed * dt).
     * @param current Posisi saat ini (pc.Vec3)
     * @param target Posisi tujuan (pc.Vec3)
     * @param maxDistanceDelta Langkah jarak per frame (kecepatan * dt)
     * @param result (Opsional) pc.Vec3 penampung hasil agar bebas alokasi Garbage Collector
     * @returns pc.Vec3 posisi baru
     */
    public static move(current: pc.Vec3, target: pc.Vec3, maxDistanceDelta: number, result?: pc.Vec3): pc.Vec3 {
        const out = result || new pc.Vec3();

        // 1. Hitung vektor dari current ke target
        this._toTarget.sub2(target, current);

        // 2. Hitung jarak kuadrat (lebih hemat kalkulasi dibanding akar kuadrat)
        const distSq = this._toTarget.lengthSq();

        // 3. Jika sudah sampai atau sisa jarak lebih kecil dari ukuran langkah
        if (distSq === 0 || (maxDistanceDelta >= 0 && distSq <= maxDistanceDelta * maxDistanceDelta)) {
            return out.copy(target);
        }

        // 4. Hitung jarak sebenarnya dan normalisasi arah
        const dist = Math.sqrt(distSq);
        this._dir.copy(this._toTarget).mulScalar(1 / dist);

        // 5. Posisi baru = current + (dir * maxDistanceDelta)
        out.copy(current).add(this._dir.mulScalar(maxDistanceDelta));
        return out;
    }

    /**
     * Alias method `calculate`, berfungsi sama persis dengan `move`
     */
    public static calculate(current: pc.Vec3, target: pc.Vec3, maxDistanceDelta: number, result?: pc.Vec3): pc.Vec3 {
        return this.move(current, target, maxDistanceDelta, result);
    }

    /**
     * Versi nilai skalar 1D / angka (seperti Mathf.MoveTowards di Unity)
     * @param current Nilai angka saat ini
     * @param target Nilai angka tujuan
     * @param maxDelta Perubahan angka maksimal
     */
    public static scalar(current: number, target: number, maxDelta: number): number {
        if (Math.abs(target - current) <= maxDelta) {
            return target;
        }
        return current + Math.sign(target - current) * maxDelta;
    }
}
