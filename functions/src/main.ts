import * as functions from 'firebase-functions'
import * as firebaseAdmin from 'firebase-admin'
const firebaseConf = functions.config().firebase
const firebaseApp = firebaseAdmin.initializeApp(firebaseConf)
import {migrateToFirestore} from './migrateToFirestore'

export = {
    migrateToFirestore: functions.https.onRequest(migrateToFirestore(firebaseApp))
}
