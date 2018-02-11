import { initializeApp } from 'firebase-admin'
import { config, https } from 'firebase-functions'
import fetch from 'node-fetch'

import { migrateToFirestore } from './migrateToFirestore'
import { generateSchedule } from './schedule-view/generate-schedule'
import { search } from './search/search'
import { generateSpeakers } from './speakers-view/generate-speakers'
import { fetchTwitter } from './twitter/fetch-twitter'

const configuration = config()
const firebaseConf = configuration.firebase
const firebaseApp = initializeApp(firebaseConf)

export = {
    fetchTwitter: https.onRequest(fetchTwitter(firebaseApp, fetch, config().twitter)),
    generateSchedule: https.onRequest(generateSchedule(firebaseApp)),
    generateSpeakers: https.onRequest(generateSpeakers(firebaseApp)),
    migrateToFirestore: https.onRequest(migrateToFirestore(firebaseApp)),
    search: https.onRequest(search(firebaseApp, configuration.algolia))
}
