import * as algoliasearch from 'algoliasearch'
import { Request, Response } from 'express'

import { AlgoliaConfig } from './config'
import { indexEvents } from './index-events'
import { indexSpeakers } from './index-speakers'
import { replaceNonWordCharsWithUnderscores, ensureNotEmpty } from '../strings'
import { RawCollection } from '../firestore/collection'

export const indexContent =
    (rawCollection: RawCollection, algoliaConfig: AlgoliaConfig) => (_: Request, response: Response) => {
        const algolia = algoliasearch(
            algoliaConfig.application_id,
            algoliaConfig.api_key
        )

        ensureNotEmpty(algoliaConfig.index_prefix, 'algoliaConfig.index_prefix')
        const indexPrefix = `${replaceNonWordCharsWithUnderscores(algoliaConfig.index_prefix)}-`
        Promise.all([
            indexSpeakers(rawCollection, algolia, indexPrefix),
            indexEvents(rawCollection, algolia, indexPrefix)
        ]).then(() => {
            response.status(200).send('Yay!')
        }).catch(error => {
            console.error(error)
            response.status(500).send('Nay!')
        })
    }
