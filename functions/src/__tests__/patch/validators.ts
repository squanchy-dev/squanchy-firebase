import { required, failure, success, isArray, isInteger, isString, isDate } from '../../patch/validator'

describe('validators', () => {
    describe('required', () => {
        it('fails on undefined values', done => {
            required(undefined)
                .then(result => expect(result).toEqual(failure('Required')))
                .then(done)
        })

        it('fails on null values', done => {
            required(null)
                .then(result => expect(result).toEqual(failure('Required')))
                .then(done)
        })

        it('passes on falsy values', done => {
            required(0)
                .then(result => expect(result).toEqual(success()))
                .then(done)
        })

        it('passes on truthy values', done => {
            required('Hello world!')
                .then(result => expect(result).toEqual(success()))
                .then(done)
        })
    })

    describe('isString', () => {
        it('passes with string values', done => {
            isString('hello world!')
                .then(result => expect(result).toEqual(success()))
                .then(done)
        })

        it('fails for non string values', done => {
            isString(123)
                .then(result => expect(result).toEqual(failure('String')))
                .then(done)
        })
    })

    describe('isDate', () => {
        it('passes for Date values', done => {
            isDate(new Date())
                .then(result => expect(result).toEqual(success()))
                .then(done)
        })

        it('fails for non Date values', done => {
            isDate(123)
                .then(result => expect(result).toEqual(failure('Date')))
                .then(done)
        })
    })

    describe('isInteger', () => {
        it('passes for integer values', done => {
            isInteger(42)
                .then(result => expect(result).toEqual(success()))
                .then(done)
        })

        it('fails for non numeric values', done => {
            isInteger('123')
                .then(result => expect(result).toEqual(failure('Integer')))
                .then(done)
        })

        it('fails for non integer numbers', done => {
            isInteger(12.3)
                .then(result => expect(result).toEqual(failure('Integer')))
                .then(done)
        })
    })

    describe('isArray', () => {
        it('passes with no validators', done => {
            isArray([])(['any', 'value'])
                .then(result => expect(result).toEqual(success()))
                .then(done)
        })

        it('passes with any empty array', done => {
            const alwaysFail = () => Promise.resolve(failure('failed'))

            isArray([alwaysFail])([])
                .then(result => expect(result).toEqual(success()))
                .then(done)
        })

        it('passes if all validators pass for all items', done => {
            isArray([required, isInteger])([1, 2, 3])
                .then(result => expect(result).toEqual(success()))
                .then(done)
        })

        it('fails if any validator fails for any item', done => {
            isArray([required, isInteger])([1, 2, 'a string'])
                .then(result => expect(result).toEqual(failure('Array')))
                .then(done)
        })
    })
})
