import { FirebaseApp } from '../firebase'
import { WithId, RawCollection } from '../firestore/collection'
import { SpeakerData, UserData, SubmissionData, TalkData } from '../firestore/data'
import { SpeakerPage } from './speakers-view-data'
import { normalizeTwitterHandle } from '../events-view/mapping-functions'
import { logAsJsonString } from '../debug-log'

export const generateSpeakers = (
    firebaseApp: FirebaseApp,
    rawCollection: RawCollection
) => () => {
    const firestore = firebaseApp.firestore()

    const speakersPromise = rawCollection<SpeakerData>('speakers')
    const usersPromise = rawCollection<UserData>('user_profiles')
    const submissionsPromise = rawCollection<SubmissionData>('submissions')
    const talksPromise = rawCollection<TalkData>('talks')

    return Promise.all([speakersPromise, usersPromise, submissionsPromise, talksPromise])
        .then(([speakers, users, submissions, talks]) => {
            return filterOutSpeakersWithNoTalks(speakers, users, submissions, talks)
        })
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

const filterOutSpeakersWithNoTalks = (
    speakers: WithId<SpeakerData>[],
    userProfiles: WithId<UserData>[],
    submissions: WithId<SubmissionData>[],
    talks: WithId<TalkData>[]
): [WithId<SpeakerData>[], WithId<UserData>[]] => {
    const talkSubmissions = submissions.filter(submission =>
        talks.some(talk => {
            if (talk.submission.id === undefined) {
                throw Error(`Found talk with no submission ID: ${talk.id}\n` +
                    `${logAsJsonString(talk.submission)}`)
            }
            if (submission.id === undefined) {
                throw Error(`Found submission with no ID: ${submission.title}\n` +
                    `${logAsJsonString(submission)}`)
            }
            return talk.submission.id === submission.id
        })
    )

    const speakersWithTalks = speakers.filter(speaker => {
        return talkSubmissions.some(submission => {
            if (submission.speakers === undefined) {
                throw Error(`Unable to parse submission with ID ${logAsJsonString(submission.id)}: no speakers`)
            }

            return submission.speakers.some(submissionSpeaker => {
                if (submissionSpeaker.id === undefined) {
                    throw Error(`The submission with ID ${logAsJsonString(submission.id)} has a speaker with` +
                        ` no ID:\n"${logAsJsonString(submissionSpeaker)}`)
                }
                return submissionSpeaker.id === speaker.id
            })
        })
    })

    return [speakersWithTalks, userProfiles]
}

const asSpeakerPage = (users: WithId<UserData>[]) => (speaker: SpeakerData): SpeakerPage => {
    const user = users.find(it => it.id === speaker.user_profile.id)!

    if (user === undefined) {
        throw Error(`Unable to find user with ID ${speaker.user_profile.id} for speaker.`)
    }

    return {
        bio: speaker.bio,
        companyName: speaker.company_name || null,
        companyUrl: speaker.company_url || null,
        id: user.id,
        name: user.full_name,
        personalUrl: speaker.personal_url || null,
        photoUrl: user.profile_pic || null,
        twitterUsername: normalizeTwitterHandle(speaker.twitter_handle) || null
    }
}
