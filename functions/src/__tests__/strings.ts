import { ensureNotEmpty, replaceNonWordCharsWithUnderscores } from '../strings'

describe('ensureNotEmpty', () => {
    it('does not throw for a non-empty, non-whitespace-only string', () => {
        expect(() => { ensureNotEmpty('banana', 'test_value') }).not.toThrow()
    })

    it('does throw for an empty string', () => {
        expect(() => { ensureNotEmpty('', 'test_value') })
            .toThrowError('The provided string test_value was empty but it must be non empty')
    })

    it('does throw for a whitespace-only string', () => {
        expect(() => { ensureNotEmpty('    ', 'test_value') })
            .toThrowError('The provided string test_value was empty but it must be non empty')
    })
})

describe('replaceNonWordCharsWithUnderscores', () => {
    it('does not change a string that only contains \w characters', () => {
        const result = replaceNonWordCharsWithUnderscores('banana')

        expect(result).toBe('banana')
    })

    it('replaces all non-\w characters with underscores', () => {
        const result = replaceNonWordCharsWithUnderscores('ba$na na')

        expect(result).toBe('ba_na_na')
    })
})
