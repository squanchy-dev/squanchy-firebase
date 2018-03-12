export interface Success {
    type: 'success'
}
export interface Failure {
    type: 'failure'
    message: string
}

export type Result = Success | Failure
export type Validator = (value?: any) => Result

export const success = (): Success => ({
    type: 'success'
})

export const failure = (message: string): Failure => ({
    message,
    type: 'failure'
})

type Predicate<T> = (value?: T) => boolean
const validate = <T>(predicate: Predicate<T>, failureMessage: string) => (value?: T) => {
    return (predicate(value)) ? success() : failure(failureMessage)
}

const validateOptional = <T>(predicate: Predicate<T>, failureMessage: string) => {
    return validate<T>(it => (it === undefined || it === null) || predicate(it), failureMessage)
}

export const required = validate<any>(it => it !== null && it !== undefined, 'Required')
export const isString = validateOptional<any>(it => typeof(it) === 'string', 'String')
export const isDate = validateOptional<any>(it => it instanceof Date, 'Date')
export const isInteger = validateOptional<any>(it => Number.isInteger(it), 'Integer')
export const isReference = validateOptional<any>(it => {
    return it.id && it.parent && it.path
}, 'Reference')
export const isArray = (validators: Validator[]) => validateOptional<any[]>(
    list => list!.every(it => validators.every(validator => validator(it).type === 'success')),
    'Array'
)
