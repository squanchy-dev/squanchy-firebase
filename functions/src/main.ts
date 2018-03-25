import { initializeApp } from 'firebase-admin'
import { config, https } from 'firebase-functions'
import fetch from 'node-fetch'

import { generateEventDetails } from './event-details-view/generate-event-details'
import { migrateToFirestore } from './migrateToFirestore'
import { patch } from './patch/patch'
import { generateSchedule } from './schedule-view/generate-schedule'
import { indexContent } from './index-contents/index-contents'
import { generateSpeakers } from './speakers-view/generate-speakers'
import { generateTracks } from './tracks-view/generate-tracks'
import { fetchTwitter } from './twitter/fetch-twitter'
import { firestoreRawCollection } from './firestore/collection'
import { httpTrigger } from './http/http-trigger'

const {
    algolia: algoliaConf,
    firebase: firebaseConf,
    patch: patchConf,
    twitter: twitterConf
} = config()

const firebaseApp = initializeApp(firebaseConf)
const rawCollection = firestoreRawCollection(patchConf.vendor_name, firebaseApp)

export = {
    fetchTwitter: https.onRequest(fetchTwitter(firebaseApp, fetch, twitterConf)),
    generateEventDetails: https.onRequest(httpTrigger(generateEventDetails(firebaseApp, rawCollection))),
    generateSchedule: https.onRequest(httpTrigger(generateSchedule(firebaseApp, rawCollection))),
    generateSpeakers: https.onRequest(generateSpeakers(firebaseApp, rawCollection)),
    generateTracks: https.onRequest(generateTracks(firebaseApp, rawCollection)),
    indexContent: https.onRequest(indexContent(rawCollection, algoliaConf)),
    migrateToFirestore: https.onRequest(migrateToFirestore(firebaseApp)),
    patch: https.onRequest(patch(firebaseApp, patchConf)),
}
