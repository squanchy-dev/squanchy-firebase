import { FirebaseApp } from '../firebase'
import { WithId, RawCollection } from '../firestore/collection'
import {
    DayData,
    TalkData,
    LevelData,
    PlaceData,
    SpeakerData,
    SubmissionData,
    TrackData,
    UserData,
} from '../firestore/data'
import { Speaker, Track, SchedulePage } from './schedule-view-data'
import { map, or, Optional, present } from '../optional'

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

    return Promise.all([
        daysPromise,
        talksPromise,
        submissionsPromise,
        placesPromise,
        tracksPromise,
        speakersPromise,
        usersPromise,
        levelsPromise
    ]).then(([
        days,
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

        return days.map(day => {
            const talksOfTheDay = talks.filter(talk => talk.day.id === day.id)
            return {
                day,
                events: talksOfTheDay.map(talk => {
                    const submission = submissions.find(({ id }) => talk.submission.id === id)!
                    const place = map(talk.place, it => places.find(({ id }) => it.id === id) || null)
                    const trackData = map(talk.track, it => tracks.find(({ id }) => it.id === id) || null)
                    const submissionLevel = submission.level

                    const level = submissionLevel
                        ? levels.find(({ id }) => submissionLevel.id === id)!.name
                        : null

                    const eventSpeakers = (submission.speakers || [])
                        .map(({ id: speakerId }) => flattenedSpeakers.find(({ id }) => id === speakerId)!)

                    const track = map(trackData, trackFrom)
                    const type = typeFrom(talk.type, track)
                    return {
                        description: submission.abstract,
                        endTime: talk.end_time,
                        experienceLevel: level,
                        id: talk.id,
                        place,
                        // TODO remove filter when data is valid again
                        speakers: eventSpeakers.filter(it => it !== undefined && it !== null),
                        startTime: talk.start_time,
                        title: submission.title,
                        track,
                        type,
                    }
                })
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
