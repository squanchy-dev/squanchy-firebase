import { WriteResult } from '@google-cloud/firestore'
import { Request, Response } from 'express'

import { base64Encode } from '../base64'
import { Fetch } from '../fetch'
import { FirebaseApp, Firestore } from '../firebase'
import { Optional, present } from '../optional'
import {
    FirestoreHashtag,
    FirestoreMedia,
    FirestoreTweet,
    FirestoreUrl,
    FirestoreUser,
    FirestoreUserMention
} from './firestore-data'
import { HashtagsEntity, MediaEntity, Tweet, UrlsEntity, User, UserMention } from './twitter-data'

interface TwitterConfig { consumer_key: string, consumer_secret: string, search_query: string }

export const fetchTwitter = (
    firebaseApp: FirebaseApp,
    fetch: Fetch,
    { consumer_key, consumer_secret, search_query }: TwitterConfig
) => (_: Request, response: Response) => {
    const authenticateTwitter = (consumerKey: string, consumerSecret: string): Promise<string> => {
        const auth = base64Encode(`${encodeURIComponent(consumerKey)}:${encodeURIComponent(consumerSecret)}`)
        return fetch('https://api.twitter.com/oauth2/token', {
            body: 'grant_type=client_credentials',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            },
            method: 'POST',
        })
            .then(result => result.json())
            .then(({ access_token }) => access_token)
    }

    const searchOnTwitter = (accessToken: string, searchParameter: string) => {
        const url = 'https://api.twitter.com/1.1/search/tweets.json'
         + `?q=${searchParameter}&count=1000&result_type=recent&tweet_mode=extended`
        return fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
            .then(result => result.json())
    }

    Promise.resolve()
        .then(() => authenticateTwitter(consumer_key, consumer_secret))
        .then(accessToken => {
            const searchParameter = encodeURIComponent(search_query)
            return searchOnTwitter(accessToken, searchParameter)
        })
        .then(json => {
            const statuses: Tweet[] = json.statuses
            return Promise.all(uploadToFirestore(firebaseApp.firestore(), statuses))
        })
        .then(() => {
            response.status(200).send(`<h2>Imported successfully all those tweets</h2>`)
        })
        .catch(error => {
            console.error(error)
            response.status(500).send(`Ruh roh... 🐛 => '${JSON.stringify(error)}'`)
        })
}

const uploadToFirestore = (firestore: Firestore, tweets: Tweet[]): Promise<WriteResult>[] => {
    const tweetsCollection = firestore.collection('social_stream')
        .doc('twitter')
        .collection('tweets')

    return tweets.filter(excludeRetweets)
        .map((rawTweet): FirestoreTweet => ({
            createdAt: new Date(rawTweet.created_at),
            displayTextRange: rawTweet.display_text_range,
            entities: {
                hashtags: firestoreHashtagsFrom(rawTweet.entities.hashtags),
                media: firestoreMediaFrom(rawTweet.entities.media),
                urls: firestoreUrlsFrom(rawTweet.entities.urls),
                userMentions: firestoreUserMentionsFrom(rawTweet.entities.user_mentions)
            },
            id: rawTweet.id_str,
            inReplyToScreenName: rawTweet.in_reply_to_screen_name || null,
            text: rawTweet.full_text,
            user: firestoreUserFrom(rawTweet.user),
        })).map(firestoreTweet => tweetsCollection.doc(firestoreTweet.id).set(firestoreTweet))
}

export const excludeRetweets = (rawTweet: Tweet) => !present(rawTweet.retweeted_status)

const firestoreUserFrom = (user: User): FirestoreUser => ({
    id: user.id_str,
    name: user.name,
    profileImageUrl: user.profile_image_url_https.replace('_normal.', '_bigger.'),
    screenName: user.screen_name,
})

const firestoreHashtagsFrom = (hashtags: Optional<HashtagsEntity[]>): FirestoreHashtag[] => {
    if (!present(hashtags)) {
        return []
    }
    return hashtags.map(hashtag => ({
        end: hashtag.indices[1],
        start: hashtag.indices[0],
        text: hashtag.text,
    }))
}

const firestoreMediaFrom = (media: Optional<MediaEntity[]>): FirestoreMedia[] => {
    if (!present(media)) {
        return []
    }
    return media.map(mediaItem => ({
        displayUrl: mediaItem.display_url,
        end: mediaItem.indices[1],
        expandedUrl: mediaItem.expanded_url,
        id: mediaItem.id_str,
        mediaUrl: mediaItem.media_url_https,
        start: mediaItem.indices[0],
        type: mediaItem.type,
        url: mediaItem.url,
    }))
}

const firestoreUrlsFrom = (urls: Optional<UrlsEntity[]>): FirestoreUrl[] => {
    if (!present(urls)) {
        return []
    }
    return urls.map(url => ({
        displayUrl: url.display_url,
        end: url.indices[1],
        expandedUrl: url.expanded_url,
        start: url.indices[0],
        url: url.url,
    }))
}

const firestoreUserMentionsFrom = (mentions: Optional<UserMention[]>): FirestoreUserMention[] => {
    if (!present(mentions)) {
        return []
    }
    return mentions.map(mention => ({
        end: mention.indices[1],
        id: mention.id_str,
        name: mention.name,
        screenName: mention.screen_name,
        start: mention.indices[0],
    }))
}
