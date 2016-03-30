class ECPoint {
    constructor(x: Uint8Array, y: Uint8Array) {
        this.X = x;
        this.Y = y;
    }
    X: Uint8Array;
    Y: Uint8Array;
}