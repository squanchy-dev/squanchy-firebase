import { Request, Response } from 'express'
import { Buffer } from "buffer";
import { FirebaseApp } from "../firebase";
import { Fetch } from "../fetch";
import { base64_encode } from '../base64';

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
            response.status(200)
                .json(json)
        })
        .catch(error => {
            response.status(500).send(error)
        })
}
