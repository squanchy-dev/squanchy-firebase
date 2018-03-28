export const awaitObject = <T>(promisesObject: { [key: string]: Promise<T> })
    : Promise<{ [key: string]: T }> => {
    return Promise.all(Object.keys(promisesObject).map(key =>
        promisesObject[key].then(value => ({ key, value }))
    ))
        .then(values => {
            return values.reduce((valuesObject, next) => ({
                ...valuesObject,
                [next.key]: next.value
            }), {} as { [fieldName: string]: T })
        })
}
