/**
 * Bounds the Worker applies before a request reaches the city object. Kept out of index.ts: a Worker's entry module may
 * export only handlers, classes and functions, and a constant exported there stops the runtime from starting (round
 * forty-three found it so).
 */

/**
 * A wallet request's body is an address and a signature, a few hundred bytes. The Worker turns away a larger one before it
 * reaches the object: the object reads and parses a session holder's body in its one thread, so a large one would hold
 * the city up (round forty-three).
 */
export const WALLET_BODY_MAX = 4096;
