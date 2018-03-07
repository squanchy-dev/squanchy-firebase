import { Request, Response } from 'express'

import { FirebaseApp } from '../firebase'
import { firestoreRawCollection, WithId } from '../firestore/collection'
import { SpeakerData, UserData } from '../firestore/data'
import { SpeakerPage } from './speakers-view-data'

export const generateSpeakers = (firebaseApp: FirebaseApp) => (_: Request, response: Response) => {
    const firestore = firebaseApp.firestore()
    const rawCollection = firestoreRawCollection(firebaseApp)

    const speakersPromise = rawCollection<SpeakerData>('speakers')
    const usersPromise = rawCollection<UserData>('user_profiles')

    Promise.all([
        speakersPromise,
        usersPromise
    ])
        .then(([speakers, users]) => {
            const speakerPages = firestore.collection('views')
                .doc('speakers')
                .collection('speaker_pages')

            return Promise.all(speakers.map(asSpeakerPage(users)).map(speakerPage => {
                return speakerPages.doc(speakerPage.id).set(speakerPage)
            }))
        })
        .then(() => {
            response.status(200).send('Yay!')
        })
        .catch(error => {
            console.error(error)
            response.status(500).send('Whoops! Something went wrong.')
        })
}

const asSpeakerPage = (users: WithId<UserData>[]) => (speaker: SpeakerData): SpeakerPage => {
    const user = users.find(it => it.id === speaker.user_profile.id)!

    return {
        bio: speaker.bio,
        companyName: speaker.company_name || null,
        companyUrl: speaker.company_url || null,
        id: user.id,
        name: user.full_name,
        personalUrl: speaker.personal_url || null,
        photoUrl: user.profile_pic || null,
        twitterUsername: speaker.twitter_handle || null
    }
}
