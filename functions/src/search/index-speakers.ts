import { AlgoliaClient } from 'algoliasearch'
import { FirebaseApp } from '../firebase'

import { firestoreRawCollection, WithId } from '../firestore/collection'
import { SpeakerData, UserData } from '../firestore/data'
import { SpeakerRecord } from './records'

export const indexSpeakers = (firebaseApp: FirebaseApp, algolia: AlgoliaClient): Promise<void> => {
    const rawCollection = firestoreRawCollection(firebaseApp)
    const speakersIndex = algolia.initIndex('speakers')

    const speakersPromise = rawCollection<SpeakerData>('speakers')
    const userProfilesPromise = rawCollection<UserData>('user_profiles')

    return Promise.all([speakersPromise, userProfilesPromise])
        .then(([speakers, userProfiles]) => toSpeakerRecords(speakers, userProfiles))
        .then(speakers => speakersIndex.addObjects(speakers))
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
