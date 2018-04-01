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
    place: Place | null
    track: Track | null
    speakers: Speaker[]
    experienceLevel: string | null
    type: string
    description: string | null
}

export interface Place {
    id: string
    name: string
    floor: string | null
}

export interface Track {
    id: string
    name: string
    accentColor: string | null
    textColor: string | null
    iconUrl: string | null
}

export interface Speaker {
    id: string
    name: string
    bio: string
    companyName: string | null
    companyUrl: string | null
    personalUrl: string | null
    photoUrl: string | null
    twitterUsername: string | null
}
