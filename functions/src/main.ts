import { initializeApp } from 'firebase-admin'
import { config, https } from 'firebase-functions'
import fetch from 'node-fetch'

import { generateEventDetails } from './event-details-view/generate-event-details'
import { migrateToFirestore } from './migrateToFirestore'
import { patch } from './patch/patch'
import { generateSchedule } from './schedule-view/generate-schedule'
import { generateSpeakers } from './speakers-view/generate-speakers'
import { fetchTwitter } from './twitter/fetch-twitter'

const firebaseConf = config().firebase
const firebaseApp = initializeApp(firebaseConf)

export = {
    fetchTwitter: https.onRequest(fetchTwitter(firebaseApp, fetch, config().twitter)),
    generateEventDetails: https.onRequest(generateEventDetails(firebaseApp)),
    generateSchedule: https.onRequest(generateSchedule(firebaseApp)),
    generateSpeakers: https.onRequest(generateSpeakers(firebaseApp)),
    migrateToFirestore: https.onRequest(migrateToFirestore(firebaseApp)),
    patch: https.onRequest(patch(firebaseApp))
}
