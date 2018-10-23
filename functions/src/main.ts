import { initializeApp } from 'firebase-admin'
import { config, https } from 'firebase-functions'
import fetch from 'node-fetch'

import { generateEventDetails } from './events-view/generate-event-details'
import { generateSchedule } from './events-view/generate-schedule'
import { migrateToFirestore } from './migrateToFirestore'
import { patch } from './patch/patch'
import { indexContent } from './index-contents/index-contents'
import { generateSpeakers } from './speakers-view/generate-speakers'
import { generateTracks } from './tracks-view/generate-tracks'
import { fetchTwitter } from './twitter/fetch-twitter'
import { firestoreRawCollection } from './firestore/collection'
import { httpTrigger } from './http/http-trigger'
import { startPatch, endPatch } from './patch/transactions'

const {
    algolia: algoliaConf,
    patch: patchConf,
    twitter: twitterConf,
    http: httpConf
} = config()

const firebaseApp = initializeApp()
const rawCollection = firestoreRawCollection(patchConf.vendor_name, firebaseApp)

export = {
    fetchTwitter: https.onRequest(fetchTwitter(firebaseApp, fetch, twitterConf)),
    generateEventDetails: https.onRequest(
        httpTrigger(generateEventDetails(firebaseApp, rawCollection), httpConf)),
    generateSchedule: https.onRequest(httpTrigger(generateSchedule(firebaseApp, rawCollection), httpConf)),
    generateSpeakers: https.onRequest(httpTrigger(generateSpeakers(firebaseApp, rawCollection), httpConf)),
    generateTracks: https.onRequest(httpTrigger(generateTracks(firebaseApp, rawCollection), httpConf)),
    indexContent: https.onRequest(httpTrigger(indexContent(rawCollection, algoliaConf), httpConf)),
    migrateToFirestore: https.onRequest(migrateToFirestore(firebaseApp)),
    patch: https.onRequest(patch(firebaseApp, patchConf)),
    startPatch: https.onRequest(startPatch(firebaseApp, patchConf, httpConf)),
    endPatch: https.onRequest(endPatch(firebaseApp, rawCollection, patchConf, algoliaConf, httpConf))
}
