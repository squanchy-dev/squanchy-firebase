import { required, failure, success } from '../../patch/validator'

describe('validators', () => {
    describe('required', () => {
        it('failure on undefined values', () => {
            const result = required(undefined)
            expect(result).toEqual(failure('Required'))
        })

        it('failure on null values', () => {
            const result = required(null)
            expect(result).toEqual(failure('Required'))
        })

        it('success on falsy values', () => {
            const result = required(0)
            expect(result).toEqual(success())
        })

        it('success on truthy values', () => {
            const result = required('Hello world!')
            expect(result).toEqual(success())
        })
    })
})
