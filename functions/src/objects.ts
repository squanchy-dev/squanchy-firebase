export const mapObject = <T, R>(object: { [key: string]: T }, fn: (val: T, key: string) => R): { [key: string]: R } => {
    return Object.keys(object).reduce((results: {}, key: string) => {
        return { ...results, [key]: fn(object[key], key) }
    }, {})
}
