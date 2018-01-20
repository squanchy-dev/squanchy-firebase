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
}

export interface User {
    id_str: string
    name: string
    screen_name: string
    profile_image_url_https: string

    // profile_sidebar_fill_color: string
    // profile_sidebar_border_color: string
    // profile_background_tile: boolean
    // created_at: string
    // location: string
    // follow_request_sent?: null
    // profile_link_color: string
    // is_translator: boolean
    // entities: UserEntities
    // default_profile: boolean
    // contributors_enabled: boolean
    // favourites_count: number
    // url?: string | null
    // profile_image_url_https: string
    // utc_offset: number
    // id: number
    // profile_use_background_image: boolean
    // listed_count: number
    // profile_text_color: string
    // lang: string
    // followers_count: number
    // protected: boolean
    // notifications?: null
    // profile_background_image_url_https: string
    // profile_background_color: string
    // verified: boolean
    // geo_enabled: boolean
    // time_zone: string
    // description: string
    // default_profile_image: boolean
    // profile_background_image_url: string
    // statuses_count: number
    // friends_count: number
    // following?: null
    // show_all_inline_media: boolean
}

// export interface UserEntities {
//     url: UserUrl
//     description: UserDescription
// }

// export interface UserDescription {
//     urls?: (null)[] | null
// }

// export interface UserUrl {
//     urls?: (UrlsEntity)[] | null
// }

export interface Entities {
    hashtags: (HashtagsEntity)[] | null
    urls: (UrlsEntity)[] | null
    media: (MediaEntity)[] | null
    user_mentions: (UserMention)[] | null
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
