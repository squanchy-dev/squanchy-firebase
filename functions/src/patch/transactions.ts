import * as express from 'express'
import { FirebaseApp } from '../firebase'
import { RawCollection } from '../firestore/collection'

import { generateSchedule } from '../schedule-view/generate-schedule'
import { generateEventDetails } from '../event-details-view/generate-event-details'
import { generateSpeakers } from '../speakers-view/generate-speakers'
import { generateTracks } from '../tracks-view/generate-tracks'
import { indexContent } from '../index-contents/index-contents'
import { httpTrigger } from '../http/http-trigger'
import { AlgoliaConfig } from '../index-contents/config'
import { authorize } from './authorize'

export const startPatch = (firebaseApp: FirebaseApp, config: PatchConfig) => {
    const expressApp = express()

    expressApp.use(authorize(config.app_token))

    expressApp.post('*', (req, res) => {
        httpTrigger(
            () => firebaseApp.firestore()
                .collection('raw_data')
                .doc(config.vendor_name)
                .delete()
        )(req, res)
    })

    return expressApp
}

export const endPatch = (
    firebaseApp: FirebaseApp,
    collection: RawCollection,
    config: PatchConfig,
    algoliaConfig: AlgoliaConfig
) => {
    const expressApp = express()

    expressApp.use(authorize(config.app_token))

    expressApp.post('*', (req, res) => {
        httpTrigger(() => Promise.all([
            generateSchedule(firebaseApp, collection)(),
            generateEventDetails(firebaseApp, collection)(),
            generateSpeakers(firebaseApp, collection)(),
            generateTracks(firebaseApp, collection)(),
            indexContent(collection, algoliaConfig)()
        ]))(req, res)
    })

    return expressApp
}
