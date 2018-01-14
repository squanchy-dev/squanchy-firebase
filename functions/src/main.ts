import { https, firestore, config } from 'firebase-functions'
import { initializeApp } from 'firebase-admin'
import { migrateToFirestore } from './migrateToFirestore'
import { generateSchedule } from './schedule-view/generate-schedule'

const firebaseConf = config().firebase
const firebaseApp = initializeApp(firebaseConf)

export = {
    migrateToFirestore: https.onRequest(migrateToFirestore(firebaseApp)),
    generateSchedule: https.onRequest(generateSchedule(firebaseApp))
}
