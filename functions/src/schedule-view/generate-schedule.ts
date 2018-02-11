import { Request, Response } from 'express'
import { FirebaseApp } from '../firebase'
import { firestoreCollection, WithId } from '../firestore/collection'
import {
    DayData,
    EventData,
    LevelData,
    PlaceData,
    SpeakerData,
    SubmissionData,
    TrackData,
    UserData,
} from '../firestore/data'
import { SchedulePage, Speaker, Track } from './schedule-view-data'
import { map } from '../optional'

export const generateSchedule = (firebaseApp: FirebaseApp) => (_: Request, response: Response) => {
    const firestore = firebaseApp.firestore()
    const collection = firestoreCollection(firebaseApp)

    const daysPromise = collection<DayData>('days')
    const eventsPromise = collection<EventData>('events')
    const submissionsPromise = collection<SubmissionData>('submissions')
    const placesPromise = collection<PlaceData>('places')
    const tracksPromise = collection<TrackData>('tracks')
    const speakersPromise = collection<SpeakerData>('speakers')
    const usersPromise = collection<UserData>('user_profiles')
    const levelsPromise = collection<LevelData>('levels')

    Promise.all([
        daysPromise,
        eventsPromise,
        submissionsPromise,
        placesPromise,
        tracksPromise,
        speakersPromise,
        usersPromise,
        levelsPromise
    ]).then(([
        days,
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

        const schedulePages = firestore.collection('views')
            .doc('schedule')
            .collection('schedule_pages')

        return Promise.all(days.map(day => {
            const eventsOfTheDay = events.filter(event => event.day.id === day.id)
            const schedulePage: SchedulePage = {
                day,
                events: eventsOfTheDay.map(event => {
                    const submission = submissions.find(({ id }) => event.submission.id === id)!
                    const place = map(event.place, it => places.find(({ id }) => it.id === id) || null)
                    const track = map(event.track, it => tracks.find(({ id }) => it.id === id) || null)
                    const submissionLevel = submission.level

                    const level = submissionLevel
                        ? levels.find(({ id }) => submissionLevel.id === id)!.name
                        : null

                    const eventSpeakers = flattenedSpeakers
                        .filter(({ id }) =>
                            (submission.speakers || [])
                                .findIndex(({ id: speakerId }) => speakerId === id) !== -1)

                    return {
                        description: submission.abstract,
                        endTime: event.end_time,
                        experienceLevel: level,
                        id: event.id,
                        place,
                        speakers: eventSpeakers,
                        startTime: event.start_time,
                        title: submission.title,
                        track: trackFrom(track),
                        type: event.type || 'talk',
                    }
                })
            }

            return schedulePages.doc(day.id).set(schedulePage)
        }))
    }).then(() => {
        response.status(200).send('Yay!')
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
