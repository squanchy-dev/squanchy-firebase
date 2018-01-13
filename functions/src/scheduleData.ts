type Optional<T> = T | null

export interface Schedule {
    pages: SchedulePage[]
}

export interface SchedulePage {
    day: Day
    events: Event[]
}

export interface Day {
    id: string
    date: Date
}

export interface Event {
    id: string
    title: string
    startTime: Date
    endTime: Date
    place: Optional<Place>
    track: Optional<Track>
    speakers: Speaker[]
    experienceLevel: Optional<string>
    type: string
    description: Optional<string>
}

export interface Place {
    id: string
    name: string
    floor: Optional<string>
}

export interface Track {
    id: string
    name: string
    accent_color: Optional<string>
    text_color: Optional<string>
    icon_url: Optional<string>
}

export interface Speaker {
    id: string
    name: string
    bio: string
    companyName: Optional<string>
    companyUrl: Optional<string>
    personalUrl: Optional<string>
    photoUrl: Optional<string>
    twitterUsername: Optional<string>
}

export type WithId<T> = T & { id: string }
export const withId = <T> (data: T, id: string): WithId<T> => ({...data as any, id})
