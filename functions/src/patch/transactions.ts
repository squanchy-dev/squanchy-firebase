import * as express from 'express'
import { FirebaseApp } from '../firebase'
import { RawCollection } from '../firestore/collection'

import { generateSchedule } from '../events-view/generate-schedule'
import { generateEventDetails } from '../events-view/generate-event-details'
import { generateSpeakers } from '../speakers-view/generate-speakers'
import { generateTracks } from '../tracks-view/generate-tracks'
import { indexContent } from '../index-contents/index-contents'
import { httpTrigger } from '../http/http-trigger'
import { AlgoliaConfig } from '../index-contents/config'
import { authorize } from './authorize'
import { HttpConfig } from '../http/config'

export const startPatch = (firebaseApp: FirebaseApp, config: PatchConfig, httpConfig: HttpConfig) => {
    const expressApp = express()

    expressApp.use(authorize(config.app_token))

    expressApp.post('*', (req, res) => {
        httpTrigger(
            () => {
                const firestore = firebaseApp.firestore()
                const allowed: string[] = req.body.collections || req.body.collection || []
                return firestore
                    .collection('raw_data')
                    .doc(config.vendor_name)
                    .getCollections()
                    .then(collections => {
                        const allowedCollections = collections.filter(it => allowed.indexOf(it.id) !== -1)
                        return Promise.all(allowedCollections.map(collection => {
                            return collection.get()
                                .then(snapshot => {
                                    const batch = firestore.batch()

                                    snapshot.docs.forEach(doc => batch.delete(doc.ref))

                                    return batch.commit()
                                })
                        }))
                    })
            },
            httpConfig
        )(req, res)
    })

    return expressApp
}

export const endPatch = (
    firebaseApp: FirebaseApp,
    collection: RawCollection,
    config: PatchConfig,
    algoliaConfig: AlgoliaConfig,
    httpConfig: HttpConfig
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
        ]), httpConfig)(req, res)
    })

    return expressApp
}
