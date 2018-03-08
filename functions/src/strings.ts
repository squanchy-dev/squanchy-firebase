export const ensureNotEmpty = (text: string, name: string) => {
    if (text.replace(/\s/g, '').length < 1) {
        throw new Error(`The provided string ${name} was empty but it must be non empty`)
    }
}

export const replaceNonWordCharsWithUnderscores = (original: string): string => {
    return original.replace(/[^a-zA-Z0-9_]/g, '_')
}
