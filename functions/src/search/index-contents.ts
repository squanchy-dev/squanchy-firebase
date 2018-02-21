import * as algoliasearch from 'algoliasearch'
import { Request, Response } from 'express'

import { FirebaseApp } from '../firebase'
import { AlgoliaConfig } from './config'
import { indexEvents } from './index-events'
import { indexSpeakers } from './index-speakers'

export const indexContent =
    (firebaseApp: FirebaseApp, algoliaConfig: AlgoliaConfig) => (_: Request, response: Response) => {
        const algolia = algoliasearch(
            algoliaConfig.application_id,
            algoliaConfig.api_key
        )

        Promise.all([
            indexSpeakers(firebaseApp, algolia),
            indexEvents(firebaseApp, algolia)
        ]).then(() => {
            response.status(200).send('Yay!')
        }).catch(error => {
            console.error(error)
            response.status(500).send('Nay!')
        })
    }
