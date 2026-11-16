"use strict";
class TransformMovement extends Movement {
    constructor(targetEntity) {
        super(targetEntity);
        // Siapkan 1 variabel penampung agar bebas Garbage Collector 
        this.moveOffset = new pc.Vec3();
    }
    /**
     * Menggerakkan entity secara langsung (Non-Fisika)
     * @param direction Arah dan kecepatan gerak (Direction * Speed)
     * @param dt Delta time dari update (waktu antar frame dalam detik)
     */
    doMove(direction, dt = 0.016) {
        if (direction.lengthSq() === 0)
            return;
        // 1. Hitung jarak geser frame ini: Direction * dt
        this.moveOffset.copy(direction).mulScalar(dt);
        // 2. Geser posisi entity di dunia 3D!                                                                                      
        this.entity.translate(this.moveOffset);
        // (Atau gunakan this.entity.translateLocal(...) jika ingin gerak relatif arah hadap objek)
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtLW1vdmVtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vdmVtZW50LXN5c3RlbS90cmFuc2Zvcm0tbW92ZW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE1BQU0saUJBQWtCLFNBQVEsUUFBUTtJQUlwQyxZQUFZLFlBQXVCO1FBQy9CLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUp4Qiw2REFBNkQ7UUFDckQsZUFBVSxHQUFHLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0lBSW5DLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsTUFBTSxDQUFDLFNBQWtCLEVBQUUsS0FBYSxLQUFLO1FBQ3pDLElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUM7WUFBRSxPQUFPO1FBRXZDLGtEQUFrRDtRQUNsRCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFOUMsNEhBQTRIO1FBQzVILElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUV2QywyRkFBMkY7SUFDL0YsQ0FBQztDQUNKIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgVHJhbnNmb3JtTW92ZW1lbnQgZXh0ZW5kcyBNb3ZlbWVudCB7XG4gICAgLy8gU2lhcGthbiAxIHZhcmlhYmVsIHBlbmFtcHVuZyBhZ2FyIGJlYmFzIEdhcmJhZ2UgQ29sbGVjdG9yIFxuICAgIHByaXZhdGUgbW92ZU9mZnNldCA9IG5ldyBwYy5WZWMzKCk7XG5cbiAgICBjb25zdHJ1Y3Rvcih0YXJnZXRFbnRpdHk6IHBjLkVudGl0eSkge1xuICAgICAgICBzdXBlcih0YXJnZXRFbnRpdHkpO1xuICAgIH1cblxuICAgIC8qKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICogTWVuZ2dlcmFra2FuIGVudGl0eSBzZWNhcmEgbGFuZ3N1bmcgKE5vbi1GaXNpa2EpXG4gICAgICogQHBhcmFtIGRpcmVjdGlvbiBBcmFoIGRhbiBrZWNlcGF0YW4gZ2VyYWsgKERpcmVjdGlvbiAqIFNwZWVkKVxuICAgICAqIEBwYXJhbSBkdCBEZWx0YSB0aW1lIGRhcmkgdXBkYXRlICh3YWt0dSBhbnRhciBmcmFtZSBkYWxhbSBkZXRpaylcbiAgICAgKi9cbiAgICBkb01vdmUoZGlyZWN0aW9uOiBwYy5WZWMzLCBkdDogbnVtYmVyID0gMC4wMTYpOiB2b2lkIHtcbiAgICAgICAgaWYgKGRpcmVjdGlvbi5sZW5ndGhTcSgpID09PSAwKSByZXR1cm47XG5cbiAgICAgICAgLy8gMS4gSGl0dW5nIGphcmFrIGdlc2VyIGZyYW1lIGluaTogRGlyZWN0aW9uICogZHRcbiAgICAgICAgdGhpcy5tb3ZlT2Zmc2V0LmNvcHkoZGlyZWN0aW9uKS5tdWxTY2FsYXIoZHQpO1xuXG4gICAgICAgIC8vIDIuIEdlc2VyIHBvc2lzaSBlbnRpdHkgZGkgZHVuaWEgM0QhICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgdGhpcy5lbnRpdHkudHJhbnNsYXRlKHRoaXMubW92ZU9mZnNldCk7XG5cbiAgICAgICAgLy8gKEF0YXUgZ3VuYWthbiB0aGlzLmVudGl0eS50cmFuc2xhdGVMb2NhbCguLi4pIGppa2EgaW5naW4gZ2VyYWsgcmVsYXRpZiBhcmFoIGhhZGFwIG9iamVrKVxuICAgIH1cbn0iXX0=