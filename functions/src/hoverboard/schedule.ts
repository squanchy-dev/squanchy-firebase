import { Firestore } from '../firebase'
import { DayData, EventData, CategoryData, extract } from '../data'

export const extractSchedule = (firestore: Firestore): Promise<HoverboardSchedule> => {
    const eventsRef = firestore.collection('events')
    return firestore.collection('days').get()
        .then(query => query.docs.map(doc => ({ ...doc.data() as DayData, id: doc.id, ref: doc.ref })))
        .then(days => {
            return Promise.all(days.map(day => {
                return eventsRef.where('day', '==', day.ref).get()
                    .then(query => query.docs.map(doc => ({ ...doc.data() as EventData, id: doc.id })))
                    .then(events => {
                        return Promise.all(events.map(event => {
                            return extract(event.submission)
                                .then(submission => extract(submission.category))
                                .then(category => ({ event, category }))
                        }))
                            .then((eventsAndCategories: EventAndCategory[]) => {
                                const categoriesSet = new Set<string>()

                                eventsAndCategories
                                    .map(it => it.category)
                                    .forEach(category => categoriesSet.add(category.name))

                                const categoryNames = Array.from(categoriesSet)

                                const timeslotsMap = new Map<string, Array<EventAndCategory>>()

                                eventsAndCategories
                                    .forEach(eventAndCategory => {
                                        const startAndEnd = _startAndEnd(eventAndCategory.event.start_time, eventAndCategory.event.end_time)
                                        const sessions = timeslotsMap.get(startAndEnd)

                                        if (sessions === undefined) {
                                            timeslotsMap.set(startAndEnd, [eventAndCategory])
                                            return
                                        }

                                        timeslotsMap.set(startAndEnd, [...sessions, eventAndCategory])
                                    })

                                const timeslots: Array<HoverboardTimeslot> = []
                                timeslotsMap.forEach((events, startAndEnd) => {
                                    timeslots.push({
                                        startTime: startOf(startAndEnd),
                                        endTime: endOf(startAndEnd),
                                        sessions: [sortedEvents(categoryNames, events)]
                                    })
                                })

                                const tracks = categoryNames.map(title => ({title}))

                                return {timeslots, tracks}
                            })
                    })
                    .then(({ timeslots, tracks }): HoverboardDay => ({
                        date: `${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`,
                        dateReadable: day.date.toDateString(),
                        timeslots: timeslots,
                        tracks: tracks
                    }))
            }))
        })
}
const sortedEvents = (categoryNames: string[], events: Array<EventAndCategory>) => {
    return events
        .sort((a, b) => {
            return trackIndexFor(categoryNames, a.category) - trackIndexFor(categoryNames, b.category)
        })
        .map(it => it.event.id)
}

const trackIndexFor = (categoryNames: string[], category: CategoryData): number => {
    return categoryNames.findIndex(categoryName => categoryName === category.name)
}

const separator = '|'

const _startAndEnd = (start: Date, end: Date) => {
    return `${start.getHours()}-${start.getMinutes()}${separator}${end.getHours()}-${end.getMinutes()}`
}

const startOf = (startAndEnd: string) => startAndEnd.substring(0, startAndEnd.indexOf(separator))
const endOf = (startAndEnd: string) => startAndEnd.substring(startAndEnd.indexOf(separator) + 1)

interface EventAndCategory {
    event: EventData & { id: string }
    category: CategoryData
}

type HoverboardSchedule = HoverboardDay[]

interface HoverboardDay {
    date: string
    dateReadable: string
    timeslots: HoverboardTimeslot[]
    tracks: HoverboardTrack[]
}

interface HoverboardTimeslot {
    startTime: string
    endTime: string
    sessions: string[][]
}

interface HoverboardTrack {
    title: string
}
