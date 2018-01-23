import firebaseAdmin = require('firebase-admin')
import firebaseFunctions = require('firebase-functions')
export import FirebaseApp = firebaseAdmin.app.App
export import Firestore = firebaseAdmin.firestore.Firestore
export { DocumentReference } from '@google-cloud/firestore'
export import Event = firebaseFunctions.Event
export import DeltaDocumentSnapshot = firebaseFunctions.firestore.DeltaDocumentSnapshot
