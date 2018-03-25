import { FirebaseApp } from '../firebase'
import { WithId, RawCollection } from '../firestore/collection'
import { SpeakerData, UserData } from '../firestore/data'
import { SpeakerPage } from './speakers-view-data'

export const generateSpeakers = (
    firebaseApp: FirebaseApp,
    rawCollection: RawCollection
) => () => {
    const firestore = firebaseApp.firestore()

    const speakersPromise = rawCollection<SpeakerData>('speakers')
    const usersPromise = rawCollection<UserData>('user_profiles')

    return Promise.all([
        speakersPromise,
        usersPromise
    ])
        .then(([speakers, users]) => speakers.map(asSpeakerPage(users)))
        .then(speakerPages => {
            const batch = firestore.batch()
            const speakerPagesCollection = firestore.collection('views')
                .doc('speakers')
                .collection('speaker_pages')

            return speakerPagesCollection.get().then(snapshot => {
                snapshot.docs.forEach(doc => batch.delete(doc.ref))
                speakerPages.forEach(speakerPage => {
                    const ref = speakerPagesCollection.doc(speakerPage.id)
                    batch.set(ref, speakerPage)
                })

                return batch.commit()
            })
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
