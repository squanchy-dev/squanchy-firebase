import { required, failure, success, isArray, isInteger } from '../../patch/validator'

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

        it('passes if all validator pass for all items', done => {
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
