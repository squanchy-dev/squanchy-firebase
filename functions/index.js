const functions = require('firebase-functions')
const firebaseAdmin = require('firebase-admin')
const firebaseConf = functions.config().firebase
const firebaseApp = firebaseAdmin.initializeApp(firebaseConf)
const {migrateToFirestore} = require('./dist/migrateToFirestore')

exports.migrateToFirestore = functions.https.onRequest(migrateToFirestore(firebaseApp));
