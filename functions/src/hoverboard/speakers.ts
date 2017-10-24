import { Firestore } from '../firebase'
import { SpeakerData, UserData } from '../data'

export const extractSpeakers = (firestore: Firestore): Promise<HoverboardSpeaker[]> => {
    return firestore.collection('speakers').get()
        .then(snapshot => snapshot.docs.map(doc => ({ ...doc.data() as SpeakerData, id: doc.id })))
        .then(speakers => {
            return Promise.all(speakers.map(speaker => {
                return speaker.user_profile.get()
                    .then(userProfile => userProfile.data())
                    .then(userData => ({ ...speaker, ...userData }))
                    .then(user => hoverboardSpeaker(user))
            }))
        })
}

interface Speaker {
    readonly bio: string | null,
    readonly company_name: string | null,
    readonly address: string | null,
    readonly id: string,
    readonly full_name: string,
    readonly profile_pic: string,
    readonly twitter_handle: string,
    readonly job_description: string
}

export interface HoverboardSpeaker {
    bio: string | null
    company: string | null
    companyLogo: string | null
    country: string | null
    featured: boolean
    id: string
    name: string
    photoUrl: string
    shortBio: string
    socials: Array<{
        icon: string
        link: string
        name: string
    }>
    tags: Array<string>
    title: string | null

}

const hoverboardSpeaker = (speaker: SpeakerData & UserData & { id: string }): HoverboardSpeaker => {
    return {
        bio: speaker.bio,
        company: speaker.company_name,
        companyLogo: null,
        country: speaker.address,
        featured: false,
        id: speaker.id,
        name: speaker.full_name,
        photoUrl: speaker.profile_pic,
        shortBio: (speaker.bio || '').substring(0, Math.min(160, (speaker.bio || '').length)),
        socials: [{
            icon: 'twitter',
            link: `https://twitter.com/${speaker.twitter_handle}/`,
            name: 'Twitter'
        }],
        tags: [],
        title: speaker.job_description
    }
}
