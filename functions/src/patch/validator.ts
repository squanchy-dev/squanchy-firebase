export interface Success {
    type: 'success'
}
export interface Failure {
    type: 'failure'
    message: string
}

export type Result = Success | Failure
export type Validator = (value?: any) => Promise<Result>

export const success = (): Success => ({
    type: 'success'
})

export const failure = (message: string): Failure => ({
    message,
    type: 'failure'
})

type Predicate<T> = (value?: T) => boolean

const validate = <T>(predicate: Predicate<T>, failureMessage: string): Validator => (value?: T) => {
    return Promise.resolve(predicate(value) ? success() : failure(failureMessage))
}

const validateOptional = <T>(predicate: Predicate<T>, failureMessage: string): Validator => {
    return validate<T>(it => (it === undefined || it === null) || predicate(it), failureMessage)
}

export const required = validate<any>(it => it !== null && it !== undefined, 'Required')
export const isString = validateOptional<any>(it => typeof (it) === 'string', 'String')
export const isDate = validateOptional<any>(it => it instanceof Date, 'Date')
export const isInteger = validateOptional<any>(it => Number.isInteger(it), 'Integer')

export const isReference: Validator = (value: any): Promise<Result> => {
    if (value === null || value === undefined) {
        return Promise.resolve(success())
    }

    return Promise.resolve(value.id && value.parent && value.path)
        .then(validFormat => {
            if (!validFormat) {
                return failure('Reference')
            }

            return value.get()
                .then((doc: any) =>
                    doc.exists
                        ? success()
                        : failure('Reference not existing'))
        })
}

export const isArray = (validators: Validator[]): Validator => (list?: any[]) => {
    const resultsPromise = list!.map(it => Promise.all(validators.map(validator => validator(it))))

    return Promise.all(resultsPromise)
        .then(arrayResults => arrayResults.every(results => results.every(it => it.type === 'success')))
        .then(validArray => validArray ? success() : failure('Array'))
}
