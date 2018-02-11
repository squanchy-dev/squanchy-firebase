import { AlgoliaClient } from 'algoliasearch'
import { FirebaseApp } from '../firebase'

import { firestoreCollection, WithId } from '../firestore/collection'
import { SpeakerData, UserData } from '../firestore/data'
import { SpeakerRecord } from './records'

export const searchSpeakers = (firebaseApp: FirebaseApp, algolia: AlgoliaClient): Promise<void> => {
    const collection = firestoreCollection(firebaseApp)
    const speakersIndex = algolia.initIndex('speakers')

    const speakersPromise = collection<SpeakerData>('speakers')
    const userProfilesPromise = collection<UserData>('user_profiles')

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
