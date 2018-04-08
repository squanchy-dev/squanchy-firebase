import { AlgoliaClient } from 'algoliasearch'

import { WithId, RawCollection } from '../firestore/collection'
import { SpeakerData, UserData, SubmissionData, TalkData } from '../firestore/data'
import { SpeakerRecord } from './records'
import { clearIndex } from './clear-index'

export const indexSpeakers = (
    rawCollection: RawCollection,
    algolia: AlgoliaClient,
    indexPrefix: string
): Promise<void> => {
    const speakersIndex = algolia.initIndex(`${indexPrefix}-speakers`)

    const speakersPromise = rawCollection<SpeakerData>('speakers')
    const userProfilesPromise = rawCollection<UserData>('user_profiles')
    const submissionsPromise = rawCollection<SubmissionData>('submissions')
    const talksPromise = rawCollection<TalkData>('talks')

    return Promise.all([speakersPromise, userProfilesPromise, submissionsPromise, talksPromise])
        .then(([speakers, userProfiles, submissions, talks]) => {
            return filterOutSpeakersWithNoTalks(speakers, userProfiles, submissions, talks)
        })
        .then(([speakers, userProfiles]) => toSpeakerRecords(speakers, userProfiles))
        .then(speakers => {
            return clearIndex(speakersIndex)
                .then(() => speakersIndex.addObjects(speakers))
        })
}

const filterOutSpeakersWithNoTalks = (
    speakers: WithId<SpeakerData>[],
    userProfiles: WithId<UserData>[],
    submissions: WithId<SubmissionData>[],
    talks: WithId<TalkData>[]
): [WithId<SpeakerData>[], WithId<UserData>[]] => {
    const talkSubmissions = submissions.filter(submission => {
        return talks.some(talk => talk.submission.id === submission.id)
    })

    const speakersWithTalks = speakers.filter(speaker => {
        return talkSubmissions.some(submission => {
            return submission.speakers.some(submissionSpeaker => submissionSpeaker.id === speaker.id)
        })
    })

    return [speakersWithTalks, userProfiles]
}

const toSpeakerRecords = (speakers: WithId<SpeakerData>[], userProfiles: WithId<UserData>[]): SpeakerRecord[] => {
    return speakers.map(speaker => {
        const userProfile = userProfiles.find(it => it.id === speaker.user_profile.id)!!

        return {
            name: userProfile.full_name,
            objectID: speaker.id,
        }
    })
}
