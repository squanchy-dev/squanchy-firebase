import { required, failure, success } from '../../patch/validator'

describe('validators', () => {
    describe('required', () => {
        it('failure on undefined values', done => {
            required(undefined)
                .then(result => expect(result).toEqual(failure('Required')))
                .then(done)
        })

        it('failure on null values', done => {
            required(null)
                .then(result => expect(result).toEqual(failure('Required')))
                .then(done)
        })

        it('success on falsy values', done => {
            required(0)
                .then(result => expect(result).toEqual(success()))
                .then(done)
        })

        it('success on truthy values', done => {
            required('Hello world!')
                .then(result => expect(result).toEqual(success()))
                .then(done)
        })
    })
})
