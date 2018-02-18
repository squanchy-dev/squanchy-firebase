import { Optional } from '../optional'

export interface Reference<T> {
    id: string
    get(): Promise<{data(): T}>
}

export const extract = <T> (ref: Reference<T>): Promise<T> => ref.get().then(it => it.data())

export interface SpeakerData {
    readonly twitter_handle: string
    readonly address: Optional<string>
    readonly job_description: Optional<string>
    readonly bio: string
    readonly company_name: Optional<string>
    readonly company_url: Optional<string>
    readonly personal_url: Optional<string>
    readonly user_profile: Reference<UserData>
}

export interface UserData {
    readonly full_name: string
    readonly profile_pic: string
}

export interface EventData {
    readonly day: Reference<DayData>
    readonly end_time: Date
    readonly place: Optional<Reference<PlaceData>>
    readonly start_time: Date
    readonly submission: Reference<SubmissionData>
    readonly track: Optional<Reference<TrackData>>
    readonly type: Optional<string>
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
    readonly level: Optional<Reference<LevelData>>
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
