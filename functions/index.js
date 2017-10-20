const functions = require('firebase-functions')
const firebaseAdmin = require('firebase-admin')
const firebaseConf = functions.config().firebase
const firebaseApp = firebaseAdmin.initializeApp(firebaseConf)

exports.migrateToFirestore = functions.https.onRequest((request, response) => {
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

    const addAllDays = data => {
        console.log("Add all days", data)
        return Promise.all(data.days.days.map(_day => {
            return days.add(day(new Date(_day.date), _day.position))
                .then(docRef => (Object.assign({}, _day, { docRef })))
        })).then(_days => (Object.assign({}, data, { days: { days: _days } })))
    }

    const addAllSpeakers = data => {
        console.log("Add all speakers", data)
        return Promise.all(data.speakers.speakers.map(_speaker => {
            return user_profiles.add(user_profile('', _speaker.name, _speaker.photo_url, _speaker.id))
                .then(userRef => speakers.add(speaker(
                    '',
                    _speaker.bio,
                    _speaker.company_name,
                    _speaker.company_url,
                    '',
                    _speaker.personal_url,
                    '',
                    _speaker.twitter_username,
                    userRef
                )))
                .then(docRef => (Object.assign({}, _speaker, { docRef })))
        })).then(_speakers => (Object.assign({}, data, { speakers: { speakers: _speakers } })))
    }

    // const addAllEvents = data => {
    //     return Promise.all(data.events.events.map(_event => {
    //         return submissions.add(submission(
    //             _event.description,
    //             designCategory.path,
    //             levelFor(_event.level),
    //             '',
    //             false,
    //         ))
    //     }))
    // }

    const levelFor = (level) => {
        switch (level) {
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

    return firebaseApp.database().ref('data').once('value').then(snapshot => {
        return Promise.resolve(snapshot.val())
            .then(data => addAllDays(data))
            .then(data => addAllSpeakers(data))
        // .then(data => addAllEvents(data))
    }).then(() => {
        response.status(200).sent('Migration completed!')
    }).catch(error => {
        console.error("Failed to migrate data", error)
        response.status(500).send()
    })
});

const orNull = val => val || null

const category = (name) => ({
    name: orNull(name)
})
const day = (date, position) => ({
    date: orNull(date),
    position: orNull(position)
})
const event = (day, start_time, end_time, place, submission, track, type) => ({
    day: orNull(day),
    start_time: orNull(start_time),
    end_time: orNull(end_time),
    place: orNull(place),
    submission: orNull(submission),
    track: orNull(track),
    type: orNull(type)
})
const level = (name) => ({
    name: orNull(name)
})
const place = (name, floor) => ({
    name: orNull(name),
    floor: orNull(floor)
})
const speaker = (address, bio, company_name, company_url, job_description, personal_url, phone_number, twitter_handle, user_profile) => ({
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
const submission = (abstract, category, level, notes, private, speakers, tags, title, type) => ({
    abstract: orNull(abstract),
    category: orNull(category),
    level: orNull(level),
    notes: orNull(notes),
    private: orNull(private),
    speakers: orNull(speakers),
    tags: orNull(tags),
    title: orNull(title),
    type: orNull(type)
})
const track = (accent_color, icon_url, name, text_color) => ({
    accent_color: orNull(accent_color),
    icon_url: orNull(icon_url),
    name: orNull(name),
    text_color: orNull(text_color)
})
const user_profile = (email, full_name, profile_pic, user_id) => ({
    email: orNull(email),
    full_name: orNull(full_name),
    profile_pic: orNull(profile_pic),
    user_id: orNull(user_id)
})
