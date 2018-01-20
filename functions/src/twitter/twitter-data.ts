export interface SearchResult {
    statuses: Tweet[]
}

export interface Tweet {
    id_str: string
    text: string
    created_at: string
    display_text_range: [number, number]
    user: User
    entities: {
        hashtags: Hashtag[]
        media: Media[]
        urls: Url[]
        user_mentions: UserMention[]
    }
}

export interface Hashtag {
    start: number
    end: number
    text: string
}

export interface HashtagsEntity {
    text: string
    indices: [number, number]
}

export interface User {
    id_str: string
    name: string
    screen_name: string
    profile_image_url: string

    profile_sidebar_fill_color: string
    profile_sidebar_border_color: string
    profile_background_tile: boolean
    created_at: string
    location: string
    follow_request_sent?: null
    profile_link_color: string
    is_translator: boolean
    entities: UserEntities
    default_profile: boolean
    contributors_enabled: boolean
    favourites_count: number
    url?: string | null
    profile_image_url_https: string
    utc_offset: number
    id: number
    profile_use_background_image: boolean
    listed_count: number
    profile_text_color: string
    lang: string
    followers_count: number
    protected: boolean
    notifications?: null
    profile_background_image_url_https: string
    profile_background_color: string
    verified: boolean
    geo_enabled: boolean
    time_zone: string
    description: string
    default_profile_image: boolean
    profile_background_image_url: string
    statuses_count: number
    friends_count: number
    following?: null
    show_all_inline_media: boolean
}

export interface Entities {
    urls?: (null)[] | null
    hashtags?: (HashtagsEntity)[] | null
    user_mentions?: (null)[] | null
}

export interface Metadata {
    iso_language_code: string
    result_type: string
}

export interface UserEntities {
    url: Url
    description: Description
}

export interface Url {
    urls?: (UrlsEntity)[] | null
}

export interface UrlsEntity {
    expanded_url?: null
    url: string
    indices?: (number)[] | null
}

export interface Description {
    urls?: (null)[] | null
}

export interface Media {
    id: number
    id_str: string
    indices: number[]
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
