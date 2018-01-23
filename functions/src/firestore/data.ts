export interface Reference<T> {
    id: string
    get(): Promise<{data(): T}>
}

export const extract = <T> (ref: Reference<T>): Promise<T> => ref.get().then(it => it.data())

export interface SpeakerData {
    readonly twitter_handle: string
    readonly address: string | null
    readonly job_description: string | null
    readonly bio: string
    readonly company_name: string | null
    readonly company_url: string | null
    readonly personal_url: string | null
    readonly user_profile: Reference<UserData>
}

export interface UserData {
    readonly full_name: string
    readonly profile_pic: string
}

export interface EventData {
    readonly day: Reference<DayData>
    readonly end_time: Date
    readonly place: Reference<PlaceData>
    readonly start_time: Date
    readonly submission: Reference<SubmissionData>
    readonly track: Reference<TrackData>
    readonly type: string
}

export interface DayData {
    readonly date: Date
    readonly position: number
}

export interface PlaceData {
    readonly floor: string
    readonly name: string
}

export interface SubmissionData {
    readonly abstract: string
    readonly category: Reference<CategoryData>
    readonly level: Reference<LevelData> | null
    readonly notes: string
    readonly private: boolean
    readonly speakers: Reference<SpeakerData>[]
    readonly tags: string[]
    readonly title: string
    readonly type: string
}

export interface TrackData {
    readonly accent_color: string
    readonly icon_url: string
    readonly name: string
    readonly text_color: string
}

export interface CategoryData {
    readonly name: string
}

export interface LevelData {
    readonly name: string
}
