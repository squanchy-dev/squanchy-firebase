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
    OtherEventData,
} from '../firestore/data'
import { Speaker, Track, Event } from './event-details-view-data'
import { map, or, Optional, present } from '../optional'

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
    const otherEventsPromise = rawCollection<OtherEventData>('other_event')

    return Promise.all([
        talksPromise,
        submissionsPromise,
        placesPromise,
        tracksPromise,
        speakersPromise,
        usersPromise,
        levelsPromise,
        otherEventsPromise
    ]).then(([
        talks,
        submissions,
        places,
        tracks,
        speakers,
        users,
        levels,
        otherEvents
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

        type AnyEvent = (WithId<OtherEventData> | WithId<TalkData>)

        const isTalk = (anyEvent: AnyEvent): anyEvent is WithId<TalkData> =>
            (anyEvent as TalkData).submission !== undefined

        const allEvents: AnyEvent[] = [...talks, ...otherEvents]

        return allEvents.map(anyEvent => {
            const place = map(anyEvent.place, it => places.find(({ id }) => it.id === id) || null)

            const baseEvent = {
                endTime: anyEvent.end_time,
                id: anyEvent.id,
                place,
                startTime: anyEvent.start_time
            }

            if (isTalk(anyEvent)) {
                const submission = submissions.find(({ id }) => anyEvent.submission.id === id)!
                const submissionLevel = submission.level
                const level = submissionLevel
                    ? levels.find(({ id }) => submissionLevel.id === id)!.name
                    : null
                const talkSpeakers = (submission.speakers || [])
                    .map(({ id: speakerId }) => flattenedSpeakers.find(({ id }) => id === speakerId)!)
                const trackData = map(anyEvent.track, it => tracks.find(({ id }) => it.id === id) || null)
                const track = map(trackData, trackFrom)
                const type = typeFrom(anyEvent.type, track)

                return {
                    ...baseEvent,
                    submission,
                    description: submission.abstract,
                    experienceLevel: level,
                    speakers: talkSpeakers.filter(it => it !== undefined && it !== null),
                    title: submission.title,
                    track,
                    type
                }
            } else {
                return {
                    ...baseEvent,
                    title: anyEvent.title,
                    type: anyEvent.type
                }
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

const trackFrom = (rawTrack: WithId<TrackData>): Track => ({
    accentColor: rawTrack.accent_color,
    iconUrl: rawTrack.icon_url,
    id: rawTrack.id,
    name: rawTrack.name,
    textColor: rawTrack.text_color,
})

const typeFrom = (talkType: Optional<string>, track: Track | null) => {
    const type = or(talkType, 'talk')

    if (type !== 'talk') {
        return type
    }

    if (present(track) && track.name.toLowerCase() === 'keynote') {
        return 'keynote'
    }

    return type
}
