import { AlgoliaIndex } from 'algoliasearch'

export const clearIndex = (index: AlgoliaIndex) => new Promise((resolve, reject) => {
    index.clearIndex(error => {
        if (error) {
            reject(error)
        } else {
            resolve(error)
        }
    })
})
