"use strict";
class MoveToward {
    // Mencegah class di-instantiate (karena ini static utility class)
    constructor() { }
    /**
     * Menggerakkan posisi 3D `current` menuju `target` dengan jarak maksimum `maxDistanceDelta` (speed * dt).
     * @param current Posisi saat ini (pc.Vec3)
     * @param target Posisi tujuan (pc.Vec3)
     * @param maxDistanceDelta Langkah jarak per frame (kecepatan * dt)
     * @param result (Opsional) pc.Vec3 penampung hasil agar bebas alokasi Garbage Collector
     * @returns pc.Vec3 posisi baru
     */
    static move(current, target, maxDistanceDelta, result) {
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
    static calculate(current, target, maxDistanceDelta, result) {
        return this.move(current, target, maxDistanceDelta, result);
    }
    /**
     * Versi nilai skalar 1D / angka (seperti Mathf.MoveTowards di Unity)
     * @param current Nilai angka saat ini
     * @param target Nilai angka tujuan
     * @param maxDelta Perubahan angka maksimal
     */
    static scalar(current, target, maxDelta) {
        if (Math.abs(target - current) <= maxDelta) {
            return target;
        }
        return current + Math.sign(target - current) * maxDelta;
    }
}
// Scratch vector static untuk mencegah alokasi memory (Garbage Collector) setiap frame
MoveToward._toTarget = new pc.Vec3();
MoveToward._dir = new pc.Vec3();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW92ZS10b3dhcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW92ZW1lbnQtc3lzdGVtL21vdmUtdG93YXJkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxNQUFNLFVBQVU7SUFLWixrRUFBa0U7SUFDbEUsZ0JBQXVCLENBQUM7SUFFeEI7Ozs7Ozs7T0FPRztJQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBZ0IsRUFBRSxNQUFlLEVBQUUsZ0JBQXdCLEVBQUUsTUFBZ0I7UUFDNUYsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRXBDLDBDQUEwQztRQUMxQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFckMseUVBQXlFO1FBQ3pFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFekMsdUVBQXVFO1FBQ3ZFLElBQUksTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixJQUFJLENBQUMsSUFBSSxNQUFNLElBQUksZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUMsRUFBRSxDQUFDO1lBQzNGLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBRUQsa0RBQWtEO1FBQ2xELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFFbkQsc0RBQXNEO1FBQ3RELEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztRQUM3RCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFRDs7T0FFRztJQUNJLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBZ0IsRUFBRSxNQUFlLEVBQUUsZ0JBQXdCLEVBQUUsTUFBZ0I7UUFDakcsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFlLEVBQUUsTUFBYyxFQUFFLFFBQWdCO1FBQ2xFLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksUUFBUSxFQUFFLENBQUM7WUFDekMsT0FBTyxNQUFNLENBQUM7UUFDbEIsQ0FBQztRQUNELE9BQU8sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLFFBQVEsQ0FBQztJQUM1RCxDQUFDOztBQXhERCx1RkFBdUY7QUFDL0Qsb0JBQVMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUMxQixlQUFJLEdBQUcsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBNb3ZlVG93YXJkIHtcbiAgICAvLyBTY3JhdGNoIHZlY3RvciBzdGF0aWMgdW50dWsgbWVuY2VnYWggYWxva2FzaSBtZW1vcnkgKEdhcmJhZ2UgQ29sbGVjdG9yKSBzZXRpYXAgZnJhbWVcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBfdG9UYXJnZXQgPSBuZXcgcGMuVmVjMygpO1xuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IF9kaXIgPSBuZXcgcGMuVmVjMygpO1xuXG4gICAgLy8gTWVuY2VnYWggY2xhc3MgZGktaW5zdGFudGlhdGUgKGthcmVuYSBpbmkgc3RhdGljIHV0aWxpdHkgY2xhc3MpXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgICAvKipcbiAgICAgKiBNZW5nZ2VyYWtrYW4gcG9zaXNpIDNEIGBjdXJyZW50YCBtZW51anUgYHRhcmdldGAgZGVuZ2FuIGphcmFrIG1ha3NpbXVtIGBtYXhEaXN0YW5jZURlbHRhYCAoc3BlZWQgKiBkdCkuXG4gICAgICogQHBhcmFtIGN1cnJlbnQgUG9zaXNpIHNhYXQgaW5pIChwYy5WZWMzKVxuICAgICAqIEBwYXJhbSB0YXJnZXQgUG9zaXNpIHR1anVhbiAocGMuVmVjMylcbiAgICAgKiBAcGFyYW0gbWF4RGlzdGFuY2VEZWx0YSBMYW5na2FoIGphcmFrIHBlciBmcmFtZSAoa2VjZXBhdGFuICogZHQpXG4gICAgICogQHBhcmFtIHJlc3VsdCAoT3BzaW9uYWwpIHBjLlZlYzMgcGVuYW1wdW5nIGhhc2lsIGFnYXIgYmViYXMgYWxva2FzaSBHYXJiYWdlIENvbGxlY3RvclxuICAgICAqIEByZXR1cm5zIHBjLlZlYzMgcG9zaXNpIGJhcnVcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIG1vdmUoY3VycmVudDogcGMuVmVjMywgdGFyZ2V0OiBwYy5WZWMzLCBtYXhEaXN0YW5jZURlbHRhOiBudW1iZXIsIHJlc3VsdD86IHBjLlZlYzMpOiBwYy5WZWMzIHtcbiAgICAgICAgY29uc3Qgb3V0ID0gcmVzdWx0IHx8IG5ldyBwYy5WZWMzKCk7XG5cbiAgICAgICAgLy8gMS4gSGl0dW5nIHZla3RvciBkYXJpIGN1cnJlbnQga2UgdGFyZ2V0XG4gICAgICAgIHRoaXMuX3RvVGFyZ2V0LnN1YjIodGFyZ2V0LCBjdXJyZW50KTtcblxuICAgICAgICAvLyAyLiBIaXR1bmcgamFyYWsga3VhZHJhdCAobGViaWggaGVtYXQga2Fsa3VsYXNpIGRpYmFuZGluZyBha2FyIGt1YWRyYXQpXG4gICAgICAgIGNvbnN0IGRpc3RTcSA9IHRoaXMuX3RvVGFyZ2V0Lmxlbmd0aFNxKCk7XG5cbiAgICAgICAgLy8gMy4gSmlrYSBzdWRhaCBzYW1wYWkgYXRhdSBzaXNhIGphcmFrIGxlYmloIGtlY2lsIGRhcmkgdWt1cmFuIGxhbmdrYWhcbiAgICAgICAgaWYgKGRpc3RTcSA9PT0gMCB8fCAobWF4RGlzdGFuY2VEZWx0YSA+PSAwICYmIGRpc3RTcSA8PSBtYXhEaXN0YW5jZURlbHRhICogbWF4RGlzdGFuY2VEZWx0YSkpIHtcbiAgICAgICAgICAgIHJldHVybiBvdXQuY29weSh0YXJnZXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gNC4gSGl0dW5nIGphcmFrIHNlYmVuYXJueWEgZGFuIG5vcm1hbGlzYXNpIGFyYWhcbiAgICAgICAgY29uc3QgZGlzdCA9IE1hdGguc3FydChkaXN0U3EpO1xuICAgICAgICB0aGlzLl9kaXIuY29weSh0aGlzLl90b1RhcmdldCkubXVsU2NhbGFyKDEgLyBkaXN0KTtcblxuICAgICAgICAvLyA1LiBQb3Npc2kgYmFydSA9IGN1cnJlbnQgKyAoZGlyICogbWF4RGlzdGFuY2VEZWx0YSlcbiAgICAgICAgb3V0LmNvcHkoY3VycmVudCkuYWRkKHRoaXMuX2Rpci5tdWxTY2FsYXIobWF4RGlzdGFuY2VEZWx0YSkpO1xuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFsaWFzIG1ldGhvZCBgY2FsY3VsYXRlYCwgYmVyZnVuZ3NpIHNhbWEgcGVyc2lzIGRlbmdhbiBgbW92ZWBcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGNhbGN1bGF0ZShjdXJyZW50OiBwYy5WZWMzLCB0YXJnZXQ6IHBjLlZlYzMsIG1heERpc3RhbmNlRGVsdGE6IG51bWJlciwgcmVzdWx0PzogcGMuVmVjMyk6IHBjLlZlYzMge1xuICAgICAgICByZXR1cm4gdGhpcy5tb3ZlKGN1cnJlbnQsIHRhcmdldCwgbWF4RGlzdGFuY2VEZWx0YSwgcmVzdWx0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBWZXJzaSBuaWxhaSBza2FsYXIgMUQgLyBhbmdrYSAoc2VwZXJ0aSBNYXRoZi5Nb3ZlVG93YXJkcyBkaSBVbml0eSlcbiAgICAgKiBAcGFyYW0gY3VycmVudCBOaWxhaSBhbmdrYSBzYWF0IGluaVxuICAgICAqIEBwYXJhbSB0YXJnZXQgTmlsYWkgYW5na2EgdHVqdWFuXG4gICAgICogQHBhcmFtIG1heERlbHRhIFBlcnViYWhhbiBhbmdrYSBtYWtzaW1hbFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgc2NhbGFyKGN1cnJlbnQ6IG51bWJlciwgdGFyZ2V0OiBudW1iZXIsIG1heERlbHRhOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICBpZiAoTWF0aC5hYnModGFyZ2V0IC0gY3VycmVudCkgPD0gbWF4RGVsdGEpIHtcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGN1cnJlbnQgKyBNYXRoLnNpZ24odGFyZ2V0IC0gY3VycmVudCkgKiBtYXhEZWx0YTtcbiAgICB9XG59XG4iXX0=