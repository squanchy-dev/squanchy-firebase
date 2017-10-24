import firebaseAdmin = require('firebase-admin')
import { Request, Response } from 'express'
import firebaseApp = firebaseAdmin.app.App

export const migrateToFirestore = (firebaseApp: firebaseApp) => (request: Request, response: Response) => {
    const firestore = firebaseApp.firestore()
    const designCategory = firestore.collection('categories').doc('xA41e90i2yqopYycx1fm')
    const days = firestore.collection('days')
    const events = firestore.collection('events')
    const [beginner, intermediate, advanced] = function () {
        const levels = firestore.collection('levels')
        return [levels.doc('PMwKSxIgWl5DkvXx6lQ2'), levels.doc('eIinu8bJeYRaIw5jSaAo'), levels.doc('IJOgm4hTYgzMbyYA59XX')]
    }()
    const places = firestore.collection('places')
    const speakers = firestore.collection('speakers')
    const submissions = firestore.collection('submissions')
    const tracks = firestore.collection('tracks')
    const user_profiles = firestore.collection('user_profiles')

    const addAllDays = (data: any) => {
        console.log('Add all days')
        return Promise.all(data.days.days.map((_day: any) => {
            return days.add(day(new Date(_day.date), _day.position))
                .then(docRef => ({ ..._day, docRef }))
        })).then(_days => ({ ...data, days: { days: _days } }))
    }

    const addAllSpeakers = (data: any) => {
        console.log('Add all speakers')
        return Promise.all(data.speakers.speakers.map((_speaker: any) => {
            return user_profiles.add(user_profile(null, _speaker.name, _speaker.photo_url, _speaker.id))
                .then(userRef => speakers.add(speaker(
                    null,
                    _speaker.bio,
                    _speaker.company_name,
                    _speaker.company_url,
                    null,
                    _speaker.personal_url,
                    null,
                    _speaker.twitter_username,
                    userRef
                )))
                .then(docRef => ({ ..._speaker, docRef }))
        })).then(_speakers => ({ ...data, speakers: { speakers: _speakers } }))
    }

    const addAllPlaces = (data: any) => {
        console.log('Add all places')
        return Promise.all(data.places.places.map((_place: any) => {
            return places.add(place(_place.name, _place.floor))
                .then(docRef => ({ ..._place, docRef }))
        })).then(_places => ({ ...data, places: { places: _places } }))
    }

    const addAllTracks = (data: any) => {
        console.log('Add all tracks')
        return Promise.all(data.tracks.tracks.map((_track: any) => {
            return tracks.add(track(_track.accent_color, _track.icon_url, _track.name, _track.text_color))
                .then(docRef => ({ ..._track, docRef }))
        })).then(_tracks => ({ ...data, tracks: { tracks: _tracks } }))
    }

    const addAllEvents = (data: any) => {
        console.log('Add all events')
        const _events = data.events.events
        return Promise.all(Object.keys(_events).map(eventKey => _events[eventKey]).map(_event => {
            return submissions.add(submission(
                _event.description,
                designCategory.path,
                levelFor(_event.experience_level),
                null,
                false,
                speakerRefsFor(data.speakers.speakers, _event.speaker_ids),
                [],
                _event.name,
                null
            )).then(submissionRef => events.add(event(
                dayRefFor(data.days.days, _event.day_id),
                new Date(_event.start_time),
                new Date(_event.end_time),
                placeRefFor(data.places.places, _event.place_id),
                submissionRef,
                trackRefFor(data.tracks.tracks, _event.track_id),
                _event.type
            )))
        }))
    }

    const levelFor = (level: any) => {
        switch (level) {
            case undefined:
            case null:
                return null;
            case 'beginner':
                return beginner
            case 'intermediate':
                return intermediate
            case 'advanced':
                return advanced
            default:
                throw new Error(`Level ${level} not recognised`)
        }
    }

    const speakerRefsFor = (speakers: any[], speakerIds: string[]) => {
        const ids = speakerIds || []
        return speakers
            .filter((speaker: any): boolean => ids.indexOf(speaker.id) !== -1)
            .map((speaker: any) => speaker.docRef)
    }

    const dayRefFor = (days: any, dayId: any) => days.find((day: any) => day.id == dayId).docRef
    const placeRefFor = (places: any, placeId: any) => places.find((place: any) => place.id == placeId).docRef
    const trackRefFor = (tracks: any, trackId: any) => tracks.find((track: any) => track.id == trackId).docRef

    return firebaseApp.database().ref('data').once('value').then(snapshot => {
        return Promise.resolve(snapshot.val())
            .then(data => addAllDays(data))
            .then(data => addAllPlaces(data))
            .then(data => addAllTracks(data))
            .then(data => addAllSpeakers(data))
            .then(data => addAllEvents(data))
    }).then(() => {
        response.status(200).send('Migration completed!')
    }).catch(error => {
        console.error('Failed to migrate data', error)
        response.status(500).send()
    })
}

const orNull = (val: any) => val || null

const category = (name: any) => ({
    name: orNull(name)
})
const day = (date: any, position: any) => ({
    date: orNull(date),
    position: orNull(position)
})
const event = (
    day: any,
    start_time: any,
    end_time: any, place: any, submission: any, track: any, type: any) => ({
        day: orNull(day),
        start_time: orNull(start_time),
        end_time: orNull(end_time),
        place: orNull(place),
        submission: orNull(submission),
        track: orNull(track),
        type: orNull(type)
    })
const level = (name: any) => ({
    name: orNull(name)
})
const place = (name: any, floor: any) => ({
    name: orNull(name),
    floor: orNull(floor)
})
const speaker = (
    address: any,
    bio: any,
    company_name: any,
    company_url: any,
    job_description: any,
    personal_url: any,
    phone_number: any,
    twitter_handle: any,
    user_profile: any
) => ({
    address: orNull(address),
    bio: orNull(bio),
    company_name: orNull(company_name),
    company_url: orNull(company_url),
    job_description: orNull(job_description),
    personal_url: orNull(personal_url),
    phone_number: orNull(phone_number),
    twitter_handle: orNull(twitter_handle),
    user_profile: orNull(user_profile)
})
const submission = (
    abstract: any,
    category: any,
    level: any,
    notes: any,
    isPrivate: any,
    speakers: any,
    tags: any,
    title: any,
    type: any
) => ({
    abstract: orNull(abstract),
    category: orNull(category),
    level: orNull(level),
    notes: orNull(notes),
    private: orNull(isPrivate),
    speakers: orNull(speakers),
    tags: orNull(tags),
    title: orNull(title),
    type: orNull(type)
})
const track = (accent_color: any, icon_url: any, name: any, text_color: any) => ({
    accent_color: orNull(accent_color),
    icon_url: orNull(icon_url),
    name: orNull(name),
    text_color: orNull(text_color)
})
const user_profile = (email: any, full_name: any, profile_pic: any, user_id: any) => ({
    email: orNull(email),
    full_name: orNull(full_name),
    profile_pic: orNull(profile_pic),
    user_id: orNull(user_id)
})
