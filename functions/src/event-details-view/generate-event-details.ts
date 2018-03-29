import { FirebaseApp } from '../firebase'
import { WithId, RawCollection } from '../firestore/collection'
import {
    TalkData,
    LevelData,
    PlaceData,
    SpeakerData,
    SubmissionData,
    TrackData,
    UserData,
} from '../firestore/data'
import { Speaker, Track, Event } from './event-details-view-data'
import { map } from '../optional'

export const generateEventDetails = (
    firebaseApp: FirebaseApp, rawCollection: RawCollection
) => () => {
    const firestore = firebaseApp.firestore()
    const talksPromise = rawCollection<TalkData>('talks')
    const submissionsPromise = rawCollection<SubmissionData>('submissions')
    const placesPromise = rawCollection<PlaceData>('places')
    const tracksPromise = rawCollection<TrackData>('tracks')
    const speakersPromise = rawCollection<SpeakerData>('speakers')
    const usersPromise = rawCollection<UserData>('user_profiles')
    const levelsPromise = rawCollection<LevelData>('levels')

    return Promise.all([
        talksPromise,
        submissionsPromise,
        placesPromise,
        tracksPromise,
        speakersPromise,
        usersPromise,
        levelsPromise
    ]).then(([
        talks,
        submissions,
        places,
        tracks,
        speakers,
        users,
        levels
    ]) => {
        const flattenedSpeakers = speakers.map(speaker => ({
            speaker,
            user: users.find(({ id }) => speaker.user_profile.id === id)!
        })).map(({ speaker, user }): Speaker => ({
            bio: speaker.bio,
            companyName: map(speaker.company_name),
            companyUrl: map(speaker.company_url),
            id: speaker.id,
            name: user.full_name,
            personalUrl: map(speaker.personal_url),
            photoUrl: user.profile_pic,
            twitterUsername: speaker.twitter_handle,
        }))

        return talks.map(talk => {
            const submission = submissions.find(({ id }) => talk.submission.id === id)!
            const place = map(talk.place, it => places.find(({ id }) => it.id === id) || null)
            const track = map(talk.track, it => tracks.find(({ id }) => it.id === id) || null)
            const submissionLevel = submission.level

            const level = submissionLevel
                ? levels.find(({ id }) => submissionLevel.id === id)!.name
                : null

            const talkSpeakers = (submission.speakers || [])
                .map(({ id: speakerId }) => flattenedSpeakers.find(({ id }) => id === speakerId)!)

            return {
                description: submission.abstract,
                endTime: talk.end_time,
                experienceLevel: level,
                id: talk.id,
                place,
                // TODO remove filter when data is valid again
                speakers: talkSpeakers.filter(it => it !== undefined && it !== null),
                startTime: talk.start_time,
                title: submission.title,
                track: trackFrom(track),
                type: talk.type || 'talk',
            }
        })
    }).then((events: Event[]) => {
        const batch = firestore.batch()

        const eventDetails = firestore.collection('views')
            .doc('event_details')
            .collection('events')

        return eventDetails.get().then(snapshot => {
            snapshot.docs.forEach(doc => batch.delete(doc.ref))

            events.forEach(event => {
                const ref = eventDetails.doc(event.id)
                batch.set(ref, event)
            })

            return batch.commit()
        })
    })
}

const trackFrom = (rawTrack: WithId<TrackData> | null): Track | null => {
    if (rawTrack === null) {
        return null
    }
    return {
        accentColor: rawTrack.accent_color,
        iconUrl: rawTrack.icon_url,
        id: rawTrack.id,
        name: rawTrack.name,
        textColor: rawTrack.text_color,
    }
}
