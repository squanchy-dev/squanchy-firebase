interface AlgoliaRecord {
    objectID: string
}

export interface EventRecord extends AlgoliaRecord {
    description?: string
    title: string
}

export interface SpeakerRecord extends AlgoliaRecord {
    name: string
}
