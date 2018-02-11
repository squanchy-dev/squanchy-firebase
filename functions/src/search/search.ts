import * as algoliasearch from 'algoliasearch'
import { Request, Response } from 'express'

import { FirebaseApp } from '../firebase'
import { AlgoliaConfig } from './config'
import { searchEvents } from './search-events'
import { searchSpeakers } from './search-speakers'

export const search = (firebaseApp: FirebaseApp, algoliaConfig: AlgoliaConfig) => (_: Request, response: Response) => {
    const algolia = algoliasearch(
        algoliaConfig.application_id,
        algoliaConfig.api_key
    )

    Promise.all([
        searchSpeakers(firebaseApp, algolia),
        searchEvents(firebaseApp, algolia)
    ]).then(() => {
        response.status(200).send('Yay!')
    }).catch(error => {
        console.error(error)
        response.status(500).send('Nay!')
    })
}
