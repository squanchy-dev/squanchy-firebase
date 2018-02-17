import * as express from 'express'
import { FirebaseApp } from '../firebase'
import { mapFields } from './map-fields'
import { Failure, required, Validator } from './validator'

const patch = (firebaseApp: FirebaseApp) => {
    const app = express()

    app.use((req, res, next) => {
        const authorization = req.headers.authorization as string

        if (!authorization || !authorization.startsWith('Bearer ')) {
            res.status(403).send('Unauthorized')
            return
        }

        const token = authorization.substr('Bearer '.length)

        if (token !== '123') { // TODO get token from config
            res.status(403).send('Unauthorized')
            return
        }

        return next()
    })

    interface CollectionsValidator {
        [key: string]: {
            [key: string]: Validator[]
        }
    }

    const collectionsValidator: CollectionsValidator = {
        bananas: {
            banana: [required],
            name: [required]
        }
    }

    app.patch('/:collection/:id', (req, res) => {
        const collection = req.params.collection as string
        const id = req.params.id as string
        const { fields } = req.body

        const validators = collectionsValidator[collection]
        if (!validators) {
            res.status(400).send(`Invalid collection ${collection}`)
            return
        }

        interface Failures {
            [key: string]: Failure[]
        }

        let body: { [field: string]: any }
        try {
            body = mapFields(firebaseApp)(fields)
        } catch (error) {
            res.status(400).send(error.toString())
            return
        }

        const failures = Object.keys(validators).reduce((results: {}, field: string) => {
            const fieldValidators = validators[field]
            const fieldResults = fieldValidators.map(it => it(body[field]))
                .filter(it => it.type === 'failure')
            return { ...results, [field]: fieldResults }
        }, {} as Failures)

        const failed = Object.keys(failures)
            .map(it => failures[it])
            .some(it => it.length > 0)

        if (failed) {
            res.status(400).json({
                failures
            })
            return
        }

        // todo transform body from FirestoreApiBody to what we want
        const firestore = firebaseApp.firestore()
        firestore.collection(collection).doc(id)
            .set(body)
            .then(() => {
                res.status(200).send()
            })
            .catch(error => {
                console.log(error)
                res.status(500).send('Something went wrong!')
            })
    })

    return app
}

export {
    patch
}
