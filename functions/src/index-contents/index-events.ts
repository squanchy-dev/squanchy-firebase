import { AlgoliaClient } from 'algoliasearch'

import { WithId, RawCollection } from '../firestore/collection'
import { EventData, SubmissionData } from '../firestore/data'
import { EventRecord } from './records'

export const indexEvents = (
    rawCollection: RawCollection,
    algolia: AlgoliaClient,
    indexPrefix: string
): Promise<void> => {
    const eventsIndex = algolia.initIndex(`${indexPrefix}-events`)

    const eventsPromise = rawCollection<EventData>('events')
    const submissionsPromise = rawCollection<SubmissionData>('submissions')
        .then(submissions => {
            return Promise.all(submissions.map(submission =>
                Promise.all(submission.speakers
                    .map(speaker => speaker.get().then(doc => doc.data())))
                    .then(speakersData =>
                        Promise.all(speakersData
                            // TODO: some data is invalid, this hack shouldn't exist :(
                            .filter(it => it !== undefined)
                            .map(speakerData =>
                                speakerData.user_profile.get()
                                    .then(doc => doc.data().full_name)
                            ))
                    )
                    .then(speakersNames => ({ ...submission, speakersNames }))
            ))
        })

    return Promise.all([
        eventsPromise,
        submissionsPromise
    ])
        .then(([events, submissions]) => toEventsRecord(events, submissions))
        .then(events => eventsIndex.addObjects(events))
}

type IndexableSubmission = WithId<SubmissionData> & { speakersNames: string[] }

const toEventsRecord = (events: WithId<EventData>[], submissions: IndexableSubmission[]): EventRecord[] => {
    return events
        .filter(it => it.type === 'talk' || it.type === 'keynote')
        .map(event => {
            const submission = submissions.find(it => it.id === event.submission.id)!!
            return {
                description: submission.abstract,
                objectID: event.id,
                speakers: submission.speakersNames,
                title: submission.title,
            }
        })
}
