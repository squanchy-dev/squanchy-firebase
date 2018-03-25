import { FirebaseApp } from '../firebase'
import { WithId, RawCollection } from '../firestore/collection'
import {
    EventData,
    LevelData,
    PlaceData,
    SpeakerData,
    SubmissionData,
    TrackData,
    UserData,
} from '../firestore/data'
import { Speaker, Track } from './event-details-view-data'
import { map } from '../optional'

export const generateEventDetails = (
    firebaseApp: FirebaseApp, rawCollection: RawCollection
) => () => {
    const firestore = firebaseApp.firestore()
    const eventsPromise = rawCollection<EventData>('events')
    const submissionsPromise = rawCollection<SubmissionData>('submissions')
    const placesPromise = rawCollection<PlaceData>('places')
    const tracksPromise = rawCollection<TrackData>('tracks')
    const speakersPromise = rawCollection<SpeakerData>('speakers')
    const usersPromise = rawCollection<UserData>('user_profiles')
    const levelsPromise = rawCollection<LevelData>('levels')

    return Promise.all([
        eventsPromise,
        submissionsPromise,
        placesPromise,
        tracksPromise,
        speakersPromise,
        usersPromise,
        levelsPromise
    ]).then(([
        eventsData,
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

        const firestoreEvents = eventsData.map(eventData => {
            const submission = submissions.find(({ id }) => eventData.submission.id === id)!
            const place = map(eventData.place, it => places.find(({ id }) => it.id === id) || null)
            const track = map(eventData.track, it => tracks.find(({ id }) => it.id === id) || null)
            const submissionLevel = submission.level

            const level = submissionLevel
                ? levels.find(({ id }) => submissionLevel.id === id)!.name
                : null

            const eventSpeakers = (submission.speakers || [])
                .map(({ id: speakerId }) => flattenedSpeakers.find(({ id }) => id === speakerId)!)

            return {
                description: submission.abstract,
                endTime: eventData.end_time,
                experienceLevel: level,
                id: eventData.id,
                place,
                // TODO remove filter when data is valid again
                speakers: eventSpeakers.filter(it => it !== undefined && it !== null),
                startTime: eventData.start_time,
                title: submission.title,
                track: trackFrom(track),
                type: eventData.type || 'talk',
            }
        })

        const batch = firestore.batch()

        const eventDetails = firestore.collection('views')
            .doc('event_details')
            .collection('events')

        return eventDetails.get().then(snapshot => {
            snapshot.docs.forEach(doc => batch.delete(doc.ref))

            firestoreEvents.forEach(event => {
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
