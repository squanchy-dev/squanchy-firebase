import * as express from 'express'
import { FirebaseApp } from '../firebase'
import { mapFields } from './map-fields'
import { mapObject } from '../objects'
import { squanchyValidators } from './squanchy-validators'
import { ensureNotEmpty } from '../strings'
import { awaitObject } from '../promise'

const patch = (firebaseApp: FirebaseApp, config: PatchConfig) => {
    ensureNotEmpty(config.vendor_name, 'config.vendor_name')

    const expressApp = express()

    expressApp.use((req, res, next) => {
        const authorization = req.headers.authorization as string

        if (!authorization || !authorization.startsWith('Bearer ')) {
            res.status(403).send('Unauthorized')
            return
        }

        const token = authorization.substr('Bearer '.length)

        if (token !== config.app_token) {
            res.status(403).send('Unauthorized')
            return
        }

        return next()
    })

    expressApp.patch('/:collection/:id', (req, res) => {
        const collection = req.params.collection as string
        const id = req.params.id as string
        const { fields } = req.body

        const validators = squanchyValidators[collection]
        if (!validators) {
            res.status(400).send(`Invalid collection ${collection}`)
            return
        }

        let body: { [field: string]: any }
        try {
            body = mapFields(firebaseApp, config.vendor_name)(fields)
        } catch (error) {
            res.status(400).send(error.toString())
            return
        }

        const failuresPromise = mapObject(
            validators,
            (fieldValidators, field) => {
                return Promise.all(fieldValidators.map(it => it(body[field])))
                    .then(results => results.filter(it => it.type === 'failure'))
            }
        )

        awaitObject(failuresPromise)
            .then(failures => {
                const failed = Object.keys(failures)
                    .map(fieldName => failures[fieldName])
                    .some(results => results.length > 0)

                if (failed) {
                    res.status(400).json({
                        failures
                    })
                    return
                }

                const firestore = firebaseApp.firestore()
                firestore.collection('raw_data').doc(config.vendor_name).collection(collection).doc(id)
                    .set(body)
                    .then(() => {
                        res.status(200).send()
                    })
                    .catch(error => {
                        console.log(error)
                        res.status(500).send('Something went wrong!')
                    })
            })
    })

    return expressApp
}

export {
    patch
}
