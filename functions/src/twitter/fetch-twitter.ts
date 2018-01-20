import { Request, Response, json } from 'express'
import { Buffer } from "buffer";
import { FirebaseApp, Firestore } from "../firebase";
import { Fetch } from "../fetch";
import { base64_encode } from '../base64';
import { Tweet, User, HashtagsEntity, MediaEntity, UrlsEntity, UserMention } from './twitter-data';
import { collection as firestoreCollection } from '../firestore/collection'
import { FirestoreTweet, FirestoreUser, FirestoreHashtag, FirestoreMedia, FirestoreUrl, FirestoreUserMention } from './firestore-data';
import { present, Optional } from '../optional';

interface TwitterConfig { consumer_key: string, consumer_secret: string, search_query: string }

export const fetchTwitter = (
    firebaseApp: FirebaseApp,
    fetch: Fetch,
    { consumer_key, consumer_secret, search_query }: TwitterConfig
) => (request: Request, response: Response) => {
    const authenticateTwitter = (consumerKey: string, consumerSecret: string): Promise<string> => {
        const auth = base64_encode(`${encodeURIComponent(consumerKey)}:${encodeURIComponent(consumerSecret)}`)
        return fetch('https://api.twitter.com/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'Authorization': `Basic ${auth}`
            },
            body: 'grant_type=client_credentials'
        })
            .then(response => response.json())
            .then(({ access_token }) => access_token)
    }

    const searchOnTwitter = (accessToken: string, searchParameter: string) => {
        return fetch(`https://api.twitter.com/1.1/search/tweets.json?q=${searchParameter}&count=1000&result_type=recent&tweet_mode=extended`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
            .then(response => response.json())
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
            response.status(500).send(`Ruh roh... 🐛 => "${JSON.stringify(error)}"`)
        })
}

const uploadToFirestore = (firestore: Firestore, tweets: Tweet[]) => {
    const tweetsCollection = firestore.collection('social_stream')
        .doc('twitter')
        .collection('tweets2')

    return tweets.map((rawTweet): FirestoreTweet => ({
        id: rawTweet.id_str,
        text: rawTweet.full_text,
        createdAt: new Date(rawTweet.created_at),
        displayTextRange: rawTweet.display_text_range,
        user: firestoreUserFrom(rawTweet.user),
        entities: {
            hashtags: firestoreHashtagsFrom(rawTweet.entities.hashtags),
            media: firestoreMediaFrom(rawTweet.entities.media),
            urls: firestoreUrlsFrom(rawTweet.entities.urls),
            userMentions: firestoreUserMentionsFrom(rawTweet.entities.user_mentions)
        }
    })).map((firestoreTweet) => {
        tweetsCollection.add(firestoreTweet)
    })
}

const firestoreUserFrom = (user: User): FirestoreUser => ({
    id: user.id_str,
    name: user.name,
    screenName: user.screen_name,
    profileImageUrl: user.profile_image_url_https.replace('_normal.', '_bigger.')
})

const firestoreHashtagsFrom = (hashtags: Optional<HashtagsEntity[]>): FirestoreHashtag[] => {
    if (!present(hashtags)) {
        return []
    }
    return hashtags.map((hashtag) => ({
        start: hashtag.indices[0],
        end: hashtag.indices[1],
        text: hashtag.text
    }))
}

const firestoreMediaFrom = (media: Optional<MediaEntity[]>): FirestoreMedia[] => {
    if (!present(media)) {
        return []
    }
    return media.map((mediaItem) => ({
        displayUrl: mediaItem.display_url,
        start: mediaItem.indices[0],
        end: mediaItem.indices[1],
        id: mediaItem.id_str,
        mediaUrl: mediaItem.media_url_https,
        expandedUrl: mediaItem.expanded_url,
        type: mediaItem.type,
        url: mediaItem.url
    }))
}

const firestoreUrlsFrom = (urls: Optional<UrlsEntity[]>): FirestoreUrl[] => {
    if (!present(urls)) {
        return []
    }
    return urls.map((url) => ({
        displayUrl: url.display_url,
        url: url.url,
        expandedUrl: url.expanded_url,
        start: url.indices[0],
        end: url.indices[1]
    }))
}

const firestoreUserMentionsFrom = (mentions: Optional<UserMention[]>): FirestoreUserMention[] => {
    if (!present(mentions)) {
        return []
    }
    return mentions.map((mention) => ({
        start: mention.indices[0],
        end: mention.indices[1],
        id: mention.id_str,
        name: mention.name,
        screenName: mention.screen_name
    }))
}
