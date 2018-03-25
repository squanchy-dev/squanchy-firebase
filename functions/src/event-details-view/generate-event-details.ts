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
        events,
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

        return events.map(event => {
            const submission = submissions.find(({ id }) => event.submission.id === id)!
            const place = map(event.place, it => places.find(({ id }) => it.id === id) || null)
            const track = map(event.track, it => tracks.find(({ id }) => it.id === id) || null)
            const submissionLevel = submission.level

            const level = submissionLevel
                ? levels.find(({ id }) => submissionLevel.id === id)!.name
                : null

            const eventSpeakers = (submission.speakers || [])
                .map(({ id: speakerId }) => flattenedSpeakers.find(({ id }) => id === speakerId)!)

            return {
                description: submission.abstract,
                endTime: event.end_time,
                experienceLevel: level,
                id: event.id,
                place,
                // TODO remove filter when data is valid again
                speakers: eventSpeakers.filter(it => it !== undefined && it !== null),
                startTime: event.start_time,
                title: submission.title,
                track: trackFrom(track),
                type: event.type || 'talk',
            }
        })
    }).then(events => {
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
