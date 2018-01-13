import { FirebaseApp } from '../firebase'
import { extractSpeakers } from './speakers'
import { extractSessions } from './sessions'
import { extractSchedule } from './schedule'
import { Request, Response } from 'express'

export const hoverboardState = (firebaseApp: FirebaseApp) => (request: Request, response: Response) => {
    const firestore = firebaseApp.firestore()
    const database = firebaseApp.database()

    Promise.resolve()
        .then(() => extractSpeakers(firestore).then(speakers => ({ speakers })))
        .then(state => extractSessions(firestore).then(sessions => ({ ...state, sessions })))
        .then(state => extractSchedule(firestore).then(schedule => ({ ...state, schedule })))
        .then(state => {

            const schedule = state.schedule.map(day => ({
                ...day,
                timeslots: day.timeslots.map(timeslot => ({
                    ...timeslot,
                    sessions: timeslot.sessions.map(sessionContainer => sessionContainer.map(session => state.sessions.findIndex(s => s.id === session)))
                }))
            }))

            return database.ref('/hoverboard/speakers').set(state.speakers)
                .then(() => database.ref('/hoverboard/sessions').set(state.sessions))
                .then(() => database.ref('/hoverboard/schedule').set(schedule))
        })
        .then(() => {
            response.status(200).send("Yay!")
        })
}
