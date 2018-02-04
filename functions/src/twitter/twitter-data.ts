import { Optional } from '../optional'

export interface SearchResult {
    statuses: Tweet[]
}

export interface Tweet {
    id_str: string
    full_text: string
    created_at: string
    display_text_range: [number, number]
    user: User
    entities: Entities
    retweeted_status: Optional<string>
    in_reply_to_screen_name: Optional<string>
}

export interface User {
    id_str: string
    name: string
    screen_name: string
    profile_image_url_https: string
}

export interface Entities {
    hashtags: Optional<HashtagsEntity[]>
    urls: Optional<UrlsEntity[]>
    media: Optional<MediaEntity[]>
    user_mentions: Optional<UserMention[]>
}

export interface HashtagsEntity {
    text: string
    indices: [number, number]
}

export interface UrlsEntity {
    expanded_url: string
    display_url: string
    url: string
    indices: [number, number]
}

export interface MediaEntity {
    id: number
    id_str: string
    indices: [number, number]
    media_url_https: string
    url: string
    display_url: string
    expanded_url: string
    type: string
    sizes: {
        medium: MediaSize
        thumb: MediaSize
        large: MediaSize
        small: MediaSize
    }
}

export interface MediaSize {
    w: number
    h: number
    resize: string
}

export interface UserMention {
    screen_name: string
    name: string
    id: number
    id_str: string
    indices: [number, number]
}
