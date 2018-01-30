import { FirebaseApp } from "../firebase"
import { Request, Response } from 'express'
import { firestoreCollection, WithId } from "../firestore/collection"
import { SpeakerData, UserData } from "../firestore/data"
import { SpeakerPage } from "./speakers-view-data"

export const generateSpeakers = (firebaseApp: FirebaseApp) => (_: Request, response: Response) => {
    const firestore = firebaseApp.firestore()
    const collection = firestoreCollection(firebaseApp)

    const speakers = collection<SpeakerData>('speakers')
    const users = collection<UserData>('user_profiles')

    Promise.all([
        speakers,
        users
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
    const user = users.find(user => user.id === speaker.user_profile.id)!

    return {
        id: user.id,
        name: user.full_name,
        bio: speaker.bio,
        companyName: speaker.company_name || null,
        companyUrl: speaker.company_url || null,
        personalUrl: speaker.personal_url || null,
        photoUrl: user.profile_pic || null,
        twitterUsername: speaker.twitter_handle || null
    }
}
