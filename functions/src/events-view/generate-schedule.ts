import { FirebaseApp } from '../firebase'
import { RawCollection } from '../firestore/collection'
import {
    DayData,
    TalkData,
    LevelData,
    PlaceData,
    SpeakerData,
    SubmissionData,
    TrackData,
    UserData,
    OtherEventData
} from '../firestore/data'
import { SchedulePage } from './events-view-data'
import { flattenSpeakers, toEvents, convertPlaceDataToPlaceDataWithNumericPosition } from './mapping-functions'

export const generateSchedule = (
    firebaseApp: FirebaseApp,
    rawCollection: RawCollection
) => () => {
    const firestore = firebaseApp.firestore()

    const daysPromise = rawCollection<DayData>('days')
    const talksPromise = rawCollection<TalkData>('talks')
    const submissionsPromise = rawCollection<SubmissionData>('submissions')
    const placesPromise = rawCollection<PlaceData>('places')
    const tracksPromise = rawCollection<TrackData>('tracks')
    const speakersPromise = rawCollection<SpeakerData>('speakers')
    const usersPromise = rawCollection<UserData>('user_profiles')
    const levelsPromise = rawCollection<LevelData>('levels')
    const otherEventsPromise = rawCollection<OtherEventData>('other_events')

    return Promise.all([
        daysPromise,
        talksPromise,
        submissionsPromise,
        placesPromise,
        tracksPromise,
        speakersPromise,
        usersPromise,
        levelsPromise,
        otherEventsPromise
    ]).then(([
        days,
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

        return days.map(day => {
            const talksOfTheDay = talks.filter(talk => talk.day.id === day.id)
            const otherEventsOfTheDay = otherEvents.filter(otherEvent => otherEvent.day.id === day.id)
            const events = toEvents(
                talksOfTheDay,
                otherEventsOfTheDay,
                convertPlaceDataToPlaceDataWithNumericPosition(places),
                submissions,
                levels,
                flattenedSpeakers,
                tracks
            )

            return {
                day,
                events
            }
        })
    }).then((schedulePages: SchedulePage[]) => {
        const schedulePagesCollection = firestore.collection('views')
            .doc('schedule')
            .collection('schedule_pages')

        const batch = firestore.batch()

        return schedulePagesCollection.get().then(snapshot => {
            snapshot.docs.forEach(doc => batch.delete(doc.ref))

            schedulePages.forEach(schedulePage => {
                const ref = schedulePagesCollection.doc(schedulePage.day.id)
                batch.set(ref, schedulePage)
            })

            return batch.commit()
        })
    })
}
