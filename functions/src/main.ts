import {https, firestore, config} from 'firebase-functions'
import {initializeApp} from 'firebase-admin'
import {migrateToFirestore} from './migrateToFirestore'
import {hoverboardState} from './hoverboard/hoverboard'

const firebaseConf = config().firebase
const firebaseApp = initializeApp(firebaseConf)

export = {
    migrateToFirestore: https.onRequest(migrateToFirestore(firebaseApp)),
    speakersToHoverboard: https.onRequest(hoverboardState(firebaseApp)),
}
