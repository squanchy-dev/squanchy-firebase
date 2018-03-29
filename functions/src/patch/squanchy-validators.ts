import {
    Validator,
    required,
    isString,
    isReference,
    isArray,
    isDate,
    isInteger
} from './validator'

interface CollectionsValidator {
    [key: string]: {
        [key: string]: Validator[]
    }
}

export const squanchyValidators: CollectionsValidator = {
    categories: {
        name: [isString]
    },
    days: {
        date: [required, isDate],
        position: [required, isInteger],
    },
    levels: {
        name: [required, isString]
    },
    other_events: {
        day: [required, isReference],
        end_time: [required, isDate],
        place: [isReference],
        start_time: [required, isDate],
        title: [required, isString],
        type: [required, isString]
    },
    places: {
        floor: [isString],
        name: [required, isString]
    },
    speakers: {
        address: [isString],
        bio: [required, isString],
        company_name: [isString],
        company_url: [isString],
        job_description: [isString],
        personal_url: [isString],
        phone_number: [isString],
        twitter_handle: [isString],
        user_profile: [required, isReference]
    },
    submission_types: {
        duration_minutes: [required, isInteger],
        name: [required, isString],
    },
    submissions: {
        abstract: [required, isString],
        category: [isReference],
        level: [required, isReference],
        notes: [isString],
        speakers: [required, isArray([required, isReference])],
        title: [required, isString]
    },
    talks: {
        day: [required, isReference],
        end_time: [required, isDate],
        place: [isReference],
        start_time: [required, isDate],
        submission: [required, isReference], // TODO required if type == talk || type == keynote
        track: [isReference], // TODO required if type == talk
        type: [required, isString]
    },
    tracks: {
        accent_color: [isString],
        icon_url: [isString],
        name: [required, isString],
        text_color: [isString]
    },
    user_profiles: {
        email: [isString],
        full_name: [required, isString],
        profile_pic: [isString],
        user_id: [required, isString]
    }
}
