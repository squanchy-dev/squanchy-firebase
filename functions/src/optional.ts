export type Optional<T> = T | null | undefined

export function present<T>(optional: Optional<T>): optional is T {
    return optional !== null && optional !== undefined
}

const identity = (a: any) => a

export function map<T, R>(it: T | null | undefined, fn: (t: T) => R = identity): R | null {
    if (it) {
        return fn(it)
    } else {
        return null
    }
}
