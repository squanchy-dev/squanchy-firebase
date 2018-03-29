import { AlgoliaClient } from 'algoliasearch'

import { WithId, RawCollection } from '../firestore/collection'
import { TalkData, SubmissionData } from '../firestore/data'
import { EventRecord } from './records'
import { clearIndex } from './clear-index'

export const indexEvents = (
    rawCollection: RawCollection,
    algolia: AlgoliaClient,
    indexPrefix: string
): Promise<void> => {
    const eventsIndex = algolia.initIndex(`${indexPrefix}-events`)

    const talksPromise = rawCollection<TalkData>('talks')
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
        talksPromise,
        submissionsPromise
    ])
        .then(([talks, submissions]) => toEventsRecord(talks, submissions))
        .then(events => {
            return clearIndex(eventsIndex)
                .then(() => eventsIndex.addObjects(events))
        })
}

type IndexableSubmission = WithId<SubmissionData> & { speakersNames: string[] }

const toEventsRecord = (talks: WithId<TalkData>[], submissions: IndexableSubmission[]): EventRecord[] => {
    return talks
        .filter(it => it.type === 'talk' || it.type === 'keynote')
        .map(talk => {
            const submission = submissions.find(it => it.id === talk.submission.id)!!
            return {
                description: submission.abstract,
                objectID: talk.id,
                speakers: submission.speakersNames,
                title: submission.title,
            }
        })
}
