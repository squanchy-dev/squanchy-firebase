import { excludeRetweets } from '../twitter/fetch-twitter'

describe('excludeRetweets', () => {
    it('Filters out tweets which are retweets', () => {
        const result = excludeRetweets({
            created_at: '2018-01-25',
            display_text_range: [1, 2],
            entities: {
                hashtags: [],
                media: [],
                urls: [],
                user_mentions: [],
            },
            full_text: 'banana',
            id_str: '123',
            in_reply_to_screen_name: 'fourlastor',
            retweeted_status: '1234',
            user: {
                id_str: '456',
                name: 'roborbio',
                profile_image_url_https: 'https://an.image',
                screen_name: 'Robertosss',
            },
        })

        expect(result).toBe(false)
    })

    it('Does not filter out tweets without retweeted_status', () => {
        const result = excludeRetweets({
            created_at: '2018-01-25',
            display_text_range: [1, 2],
            entities: {
                hashtags: [],
                media: [],
                urls: [],
                user_mentions: [],
            },
            full_text: 'banana',
            id_str: '123',
            in_reply_to_screen_name: 'fourlastor',
            retweeted_status: undefined,
            user: {
                id_str: '456',
                name: 'roborbio',
                profile_image_url_https: 'https://an.image',
                screen_name: 'Robertosss',
            },
        })

        expect(result).toBe(true)
    })

    it('Does not filter out tweets with null retweeted_status', () => {
        const result = excludeRetweets({
            created_at: '2018-01-25',
            display_text_range: [1, 2],
            entities: {
                hashtags: [],
                media: [],
                urls: [],
                user_mentions: [],
            },
            full_text: 'banana',
            id_str: '123',
            in_reply_to_screen_name: 'fourlastor',
            retweeted_status: null,
            user: {
                id_str: '456',
                name: 'roborbio',
                profile_image_url_https: 'https://an.image',
                screen_name: 'Robertosss',
            },
        })

        expect(result).toBe(true)
    })
})
