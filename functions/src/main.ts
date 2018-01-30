import { https, config } from 'firebase-functions'
import { initializeApp } from 'firebase-admin'
import { migrateToFirestore } from './migrateToFirestore'
import { generateSchedule } from './schedule-view/generate-schedule'
import { fetchTwitter } from './twitter/fetch-twitter';
import fetch from "node-fetch";
import { generateSpeakers } from './speakers-view/generate-speakers';

const firebaseConf = config().firebase
const firebaseApp = initializeApp(firebaseConf)

export = {
    migrateToFirestore: https.onRequest(migrateToFirestore(firebaseApp)),
    generateSchedule: https.onRequest(generateSchedule(firebaseApp)),
    generateSpeakers: https.onRequest(generateSpeakers(firebaseApp)),
    fetchTwitter: https.onRequest(fetchTwitter(firebaseApp, fetch, config().twitter)),
}
