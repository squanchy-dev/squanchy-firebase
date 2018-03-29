export type Optional<T> = T | null | undefined

export function present<T>(optional: Optional<T>): optional is T {
    return optional !== null && optional !== undefined
}

const identity = (a: any) => a

export function or<T>(it: Optional<T>, other: T): T {
    return (present(it)) ? it : other
}

export function map<T, R>(it: Optional<T>, fn: (t: T) => R = identity): R | null {
    if (present(it)) {
        return fn(it)
    } else {
        return null
    }
}
