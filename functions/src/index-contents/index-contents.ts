import * as algoliasearch from 'algoliasearch'

import { AlgoliaConfig } from './config'
import { indexEvents } from './index-events'
import { indexSpeakers } from './index-speakers'
import { replaceNonWordCharsWithUnderscores, ensureNotEmpty } from '../strings'
import { RawCollection } from '../firestore/collection'

export const indexContent = (rawCollection: RawCollection, algoliaConfig: AlgoliaConfig) =>
    () => {
        const algolia = algoliasearch(
            algoliaConfig.application_id,
            algoliaConfig.api_key
        )

        ensureNotEmpty(algoliaConfig.index_prefix, 'algoliaConfig.index_prefix')
        const indexPrefix = replaceNonWordCharsWithUnderscores(algoliaConfig.index_prefix)
        return Promise.all([
            indexSpeakers(rawCollection, algolia, indexPrefix),
            indexEvents(rawCollection, algolia, indexPrefix)
        ])
    }
