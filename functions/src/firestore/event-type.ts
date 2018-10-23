export enum Type {
    REGISTRATION = 'registration',
    TALK = 'talk',
    KEYNOTE = 'keynote',
    COFFEE_BREAK = 'coffee_break',
    LUNCH = 'lunch',
    SOCIAL = 'social',
    OTHER = 'other',
    WORKSHOP = 'workshop'
}

export const isValidType = (rawType: string | null) => {
    if (rawType === null) {
        return false
    }

    return Object.keys(Type).map(k => Type[k as any])
        .some(type => type === rawType.toLowerCase())
}
