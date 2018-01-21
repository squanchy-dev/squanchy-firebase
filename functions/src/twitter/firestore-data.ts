export interface FirestoreTweet {
    id: string
    text: string
    createdAt: Date
    displayTextRange: [number, number]
    user: FirestoreUser
    inReplyToScreenName: string | null
    entities: {
        hashtags: FirestoreHashtag[]
        media: FirestoreMedia[]
        urls: FirestoreUrl[]
        userMentions: FirestoreUserMention[]
    }
}

export interface FirestoreUser {
    id: string
    name: string
    screenName: string
    profileImageUrl: string
}

export interface FirestoreHashtag {
    start: number
    end: number
    text: string
}

export interface FirestoreMedia {
    displayUrl: string
    start: number
    end: number
    id: string
    mediaUrl: string
    expandedUrl: string
    type: string
    url: string
}

export interface FirestoreUrl {
    displayUrl: string
    url: string
    expandedUrl: string
    start: number
    end: number
}

export interface FirestoreUserMention {
    start: number
    end: number
    id: string
    name: string
    screenName: string
}
