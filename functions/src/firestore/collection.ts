import { FirebaseApp } from "../firebase";

export const collection = (firebaseApp: FirebaseApp) => <T>(collection: string): Promise<WithId<T>[]> => {
    return firebaseApp.firestore().collection(collection)
        .get()
        .then(value => {
            return value.docs.map(doc => withId(doc.data() as T, doc.id))
        })
}

export type WithId<T> = T & { id: string }
const withId = <T>(data: T, id: string): WithId<T> => ({ ...data as any, id })
