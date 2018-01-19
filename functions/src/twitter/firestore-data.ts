export interface Tweet {
    id: string
    text: string
    createdAt: Date
    displayTextRange: [number, number]
    user: User
    entities: {
        hashtags: Hashtag[]
        media: Media[]
        urls: Url[]
        userMentions: UserMention[]
    }
}

export interface User {
    id: string
    name: string
    screenName: string
    profileImageUrl: string
}

export interface Hashtag {
    start: number
    end: number
    text: string
}

export interface Media {
    displayUrl: string
    start: number
    end: number
    id: string
    mediaUrl: string
    expandedUrl: string
    type: "photo"
    url: string
}

export interface Url {
    displayUrl: string
    url: string
    expandedUrl: string
    start: number
    end: number
}

export interface UserMention {
    start: number
    end: number
    id: string
    name: string
    screenName: string
}
