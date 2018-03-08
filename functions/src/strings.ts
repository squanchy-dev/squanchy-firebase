export const ensureNotEmpty = (text: string, name: string) => {
    if (text.trim.length === 0) {
        throw new Error(`The provided string ${name} was empty but it must be non empty`)
    }
}

export const replaceNonWordCharsWithUnderscores = (original: string): string => {
    return original.replace(/[^\w]/, '_')
}
