import { FirebaseApp } from '../firebase'
import { RawCollection } from '../firestore/collection'
import { TrackData } from '../firestore/data'

export const generateTracks = (
    firebaseApp: FirebaseApp,
    rawCollection: RawCollection
) => () => {
    const firestore = firebaseApp.firestore()

    const tracksPromise = rawCollection<TrackData>('tracks')

    return tracksPromise.then(tracks => {
        return tracks.map(trackData => {
            return {
                accentColor: trackData.accent_color,
                iconUrl: trackData.icon_url,
                id: trackData.id,
                name: trackData.name,
                textColor: trackData.text_color
            }
        })
    })
        .then(tracks => {
            const batch = firestore.batch()
            const tracksCollection = firestore.collection('views')
                .doc('tracks')
                .collection('tracks')

            return tracksCollection.get().then(snapshot => {
                snapshot.docs.forEach(doc => batch.delete(doc.ref))
                tracks.forEach(track => {
                    const ref = tracksCollection.doc(track.id)
                    batch.set(ref, track)
                })

                return batch.commit()
            })
        })
}
