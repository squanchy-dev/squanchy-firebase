import { FirebaseApp } from '../firebase'

export const firestoreRawCollection =
    (vendorName: string, firebaseApp: FirebaseApp) => <T>(collection: string): Promise<WithId<T>[]> => {
        return firebaseApp.firestore().collection('raw_data').doc(vendorName).collection(collection)
            .get()
            .then(value => {
                return value.docs.map(doc => withId(doc.data() as T, doc.id))
            })
    }

export type RawCollection = <T>(collection: string) => Promise<WithId<T>[]>

export type WithId<T> = T & { id: string }
const withId = <T>(data: T, id: string): WithId<T> => ({ ...data as any, id })
