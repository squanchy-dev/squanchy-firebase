import { FirebaseApp } from '../firebase'
import { extractSpeakers } from './speakers'
import { extractSessions } from './sessions'
import { extractSchedule } from './schedule'
import {Request, Response} from 'express'

export const hoverboardState = (firebaseApp: FirebaseApp) => (request: Request, response: Response) => {
    const firestore = firebaseApp.firestore()

    Promise.resolve()
        .then(() => extractSpeakers(firestore).then(speakers => ({ speakers })))
        .then(state => extractSessions(firestore).then(sessions => ({ ...state, sessions })))
        .then(state => extractSchedule(firestore).then(schedule => ({ ...state, schedule })))
        .then(state => {
            response.status(200).json(state)
        })
}
