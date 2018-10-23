import { Speaker, Track, Event } from './events-view-data'
import { map, or, Optional, present } from '../optional'
import { WithId } from '../firestore/collection'
import {
    TalkData,
    LevelData,
    SpeakerData,
    SubmissionData,
    TrackData,
    UserData,
    OtherEventData,
    PlaceData
} from '../firestore/data'
import { asDebugJsonString } from '../debug-json-formatter'
import { isValidType } from '../firestore/event-type'
import { isValidLevel } from '../firestore/experience-level'

export const flattenSpeakers = (speakers: WithId<SpeakerData>[], users: WithId<UserData>[]): Speaker[] => {
    return speakers.map(speaker => ({
        speaker,
        user: users.find(({ id }) => speaker.user_profile.id === id)!
    })).map(({ speaker, user }): Speaker => {
        if (speaker.id === undefined) {
            throw Error(`Speaker missing ID: ${asDebugJsonString(speaker)}`)
        }
        if (speaker.bio === undefined) {
            throw Error(`Speaker missing bio: ${asDebugJsonString(speaker.id)}`)
        }
        if (user === undefined) {
            throw Error(`Unable to find user profile: ${asDebugJsonString(speaker.user_profile.id)}` +
                ` for speaker ${speaker.id}`)
        }
        if (user.full_name === undefined) {
            throw Error(`User missing full_name: ${asDebugJsonString(user.id)}`)
        }

        return ({
            bio: speaker.bio,
            companyName: map(speaker.company_name),
            companyUrl: map(speaker.company_url),
            id: speaker.id,
            name: user.full_name,
            personalUrl: map(speaker.personal_url),
            photoUrl: user.profile_pic,
            twitterUsername: normalizeTwitterHandle(speaker.twitter_handle)
        })
    })
}

export const normalizeTwitterHandle = (rawHandle: string): string | null => {
    const regex = /(?:^@?(\w{1,15})$|(?:(?:https?:\/\/)?twitter\.com\/)@?(\w{1,15}))/i
    const matches = regex.exec(rawHandle)

    if (matches === null || matches.length === 0) {
        return null
    } else if (matches[1] !== undefined) {
        return matches[1]
    } else if (matches[2] !== undefined) {
        return matches[2]
    } else {
        return null
    }
}

export const toEvents = (
    talks: WithId<TalkData>[],
    otherEvents: WithId<OtherEventData>[],
    places: WithId<PlaceData>[],
    submissions: WithId<SubmissionData>[],
    levels: WithId<LevelData>[],
    flattenedSpeakers: Speaker[],
    tracks: WithId<TrackData>[]
): Event[] => {
    const allEvents: AnyEvent[] = [...talks, ...otherEvents]

    return allEvents.map(event => {
        const place = map(event.place, it => places.find(({ id }) => it.id === id) || null)

        if (event.id === undefined) {
            throw Error(`Event missing ID: ${asDebugJsonString(event)}`)
        }
        if (event.start_time === undefined) {
            throw Error(`Event missing start_time: ${asDebugJsonString(event.id)}`)
        }
        if (event.end_time === undefined) {
            throw Error(`Event missing end_time: ${asDebugJsonString(event.id)}`)
        }

        const baseEvent = {
            endTime: event.end_time,
            id: event.id,
            place,
            startTime: event.start_time
        }

        if (event.type === undefined) {
            throw Error(`Event missing type: ${asDebugJsonString(event.id)}`)
        } else if (!isValidType(event.type)) {
            throw Error(`Submission ${event.id} has invalid type ${event.type}`)
        }

        if (isTalk(event)) {
            const submission = submissions.find(({ id }) => event.submission.id === id)!
            if (submission === undefined) {
                throw Error(`Unable to find submission with ID ${event.submission.id} for event ${event.id}`)
            }

            const level = extractLevelFrom(submission, levels)

            const talkSpeakers = (submission.speakers || [])
                .map(({ id: speakerId }) => flattenedSpeakers.find(({ id }) => id === speakerId)!)
            const trackData = map(event.track, it => tracks.find(({ id }) => it.id === id) || null)
            const track = map(trackData, trackFrom)
            const type = typeFrom(event.type, track)

            if (level !== undefined && !isValidLevel(level)) {
                throw Error(`Submission ${submission.id} has invalid level ${level}`)
            }

            if (submission.title === undefined) {
                throw Error(`Submission missing title: ${asDebugJsonString(submission.id)}`)
            }

            return {
                ...baseEvent,
                // submission,     TODO remove?
                description: submission.abstract,
                experienceLevel: level,
                speakers: talkSpeakers.filter(it => it !== undefined && it !== null),
                title: submission.title,
                track,
                type
            }
        } else {
            if (event.title === undefined) {
                throw Error(`Event missing title: ${asDebugJsonString(event.id)}`)
            }

            return {
                ...baseEvent,
                title: event.title,
                type: event.type
            }
        }
    })
}

type AnyEvent = (WithId<OtherEventData> | WithId<TalkData>)

const isTalk = (anyEvent: AnyEvent): anyEvent is WithId<TalkData> =>
    (anyEvent as TalkData).submission !== undefined

const extractLevelFrom = (submission: WithId<SubmissionData>, levels: WithId<LevelData>[]) => {
    const submissionLevel = submission.level
    if (!submissionLevel) {
        return null
    }

    const matchingLevel = levels.find(({ id }) => submissionLevel.id === id)
    if (matchingLevel === undefined) {
        throw Error(`Unsupported level ${asDebugJsonString(submissionLevel)} found ` +
            `in submission ${submission.id}`)
    }
    return matchingLevel.name
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
