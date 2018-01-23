export type Optional<T> = T | null | undefined

export function present<T>(optional: Optional<T>): optional is T {
    return optional !== null && optional !== undefined
}
