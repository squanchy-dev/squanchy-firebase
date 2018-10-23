export enum Level {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced'
}

export const isValidLevel = (rawLevel: string | null) => {
    if (rawLevel === null) {
        return true
    }

    return Object.keys(Level).map(k => Level[k as any])
        .some(level => level === rawLevel.toLowerCase())
}
