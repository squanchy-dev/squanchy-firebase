import { Event } from '../event-details-view/event-details-view-data'

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
