import { Firestore } from '../firebase'
import { HoverboardSpeaker } from './speakers'
import { SessionData, PlaceData, DayData, SubmissionData, TrackData, extract, LevelData } from '../data'

export const extractSessions = (firestore: Firestore, speakers: HoverboardSpeaker[]): Promise<HoverboardSession[]> => {
    return firestore.collection('events').get()
        .then(snapshot => snapshot.docs.map(doc => ({ ...doc.data() as SessionData, id: doc.id })))
        .then(sessionsData => {

            const extractLevel = (submission: SubmissionData): Promise<FlattenedSubmission> => {
                if (submission.level == undefined) return Promise.resolve({...submission, level: undefined})

                return extract(submission.level).then(level => ({...submission, level}))
            }

            return Promise.all(sessionsData.map(sessionData => {
                return Promise.all([
                    extract(sessionData.place),
                    extract(sessionData.day),
                    extract(sessionData.submission).then(it => extractLevel(it)),
                    extract(sessionData.track)
                ]).then(([place, day, submission, track]: [PlaceData, DayData, FlattenedSubmission, TrackData]) => ({
                    ...sessionData,
                    place,
                    day,
                    track,
                    submission
                }))
            }))
        })
        .then(sessions => sessions.map(session => ({
            complexity: (session.submission.level) ? session.submission.level.name : undefined,
            description: session.submission.abstract,
            id: session.id,
            language: 'English',
            presentation: null,
            speakers: [],
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
}
