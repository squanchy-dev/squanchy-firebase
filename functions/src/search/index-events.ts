import { AlgoliaClient } from 'algoliasearch'

import { WithId, RawCollection } from '../firestore/collection'
import { EventData, SubmissionData } from '../firestore/data'
import { EventRecord } from './records'

export const indexEvents = (
    rawCollection: RawCollection,
    algolia: AlgoliaClient,
    indexPrefix: string
): Promise<void> => {
    const eventsIndex = algolia.initIndex(`${indexPrefix}events`)

    const eventsPromise = rawCollection<EventData>('events')
    const submissionsPromise = rawCollection<SubmissionData>('submissions')

    return Promise.all([
        eventsPromise,
        submissionsPromise
    ])
        .then(([events, submissions]) => toEventsRecord(events, submissions))
        .then(events => eventsIndex.addObjects(events))
}

const toEventsRecord = (events: WithId<EventData>[], submissions: WithId<SubmissionData>[]): EventRecord[] => {
    return events
        .filter(it => it.type === 'talk' || it.type === 'keynote')
        .map(event => {
            const submission = submissions.find(it => it.id === event.submission.id)!!
            return {
                description: submission.abstract,
                objectID: event.id,
                title: submission.title,
            }
        })
}
