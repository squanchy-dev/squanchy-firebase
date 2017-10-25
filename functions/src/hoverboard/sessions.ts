import { Firestore } from '../firebase'
import { HoverboardSpeaker } from './speakers'
import { EventData, PlaceData, DayData, SubmissionData, TrackData, extract, LevelData, Reference, SpeakerData } from '../data'

export const extractSessions = (firestore: Firestore): Promise<HoverboardSession[]> => {
    return firestore.collection('events').get()
        .then(snapshot => snapshot.docs.map(doc => ({ ...doc.data() as EventData, id: doc.id })))
        .then(eventsData => {

            const extractLevel = (submission: SubmissionData): Promise<FlattenedSubmission> => {
                if (submission.level === undefined) return Promise.resolve({...submission, level: undefined})

                return extract(submission.level).then(level => ({...submission, level}))
            }

            return Promise.all(eventsData.map(eventData => {
                return Promise.all([
                    extract(eventData.place),
                    extract(eventData.day),
                    extract(eventData.submission).then(it => extractLevel(it)),
                    extract(eventData.track)
                ]).then(([place, day, submission, track]: [PlaceData, DayData, FlattenedSubmission, TrackData]) => ({
                    ...eventData,
                    place,
                    day,
                    track,
                    submission,
                    speakers: submission.speakers.map(it => it.id)
                }))
            }))
        })
        .then(sessions => sessions.map(session => ({
            complexity: (session.submission.level) ? session.submission.level.name : undefined,
            description: session.submission.abstract,
            id: session.id,
            language: 'English',
            presentation: null,
            speakers: session.speakers,
            tags: [session.track.name],
            title: session.submission.title
        })))
}

export interface HoverboardSession {
    complexity: string|undefined
    description: string
    id: string
    language: string
    presentation: string|null
    speakers: Array<string>
    tags: Array<string>
    title: string
}

interface FlattenedSubmission {
    readonly abstract: string
    readonly level: LevelData|undefined
    readonly notes: string
    readonly private: boolean
    readonly tags: string[]
    readonly title: string
    readonly type: string
    readonly speakers: Reference<SpeakerData>[]
}
