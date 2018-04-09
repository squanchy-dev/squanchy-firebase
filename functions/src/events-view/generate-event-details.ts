import { FirebaseApp } from '../firebase'
import { RawCollection } from '../firestore/collection'
import {
    TalkData,
    LevelData,
    PlaceData,
    SpeakerData,
    SubmissionData,
    TrackData,
    UserData,
    OtherEventData
} from '../firestore/data'
import { flattenSpeakers, toEvents } from './mapping-functions'
import { Event } from './events-view-data'

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
    const otherEventsPromise = rawCollection<OtherEventData>('other_events')

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
        const flattenedSpeakers = flattenSpeakers(speakers, users)

        return toEvents(
            talks,
            otherEvents,
            places,
            submissions,
            levels,
            flattenedSpeakers,
            tracks
        )
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
