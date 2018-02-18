
export interface Success {
    type: 'success'
}
export interface Failure {
    type: 'failure'
    message: string
}

export type Result = Success | Failure
export type Validator = (value: any) => Result

export const success = (): Success => ({
    type: 'success'
})

export const failure = (message: string): Failure => ({
    message,
    type: 'failure'
})

export const required = (value: any) => value ? success() : failure('Required')
