import {excludeRetweets} from "../twitter/fetch-twitter"

describe("excludeRetweets", () => {
    it("Filters out tweets which are retweets", () => {
        const result = excludeRetweets({
            id_str: '123',
            created_at: '2018-01-25',
            full_text: 'banana',
            display_text_range: [1,2],
            entities: {
                hashtags: [],
                media: [],
                urls: [],
                user_mentions: []
            },
            in_reply_to_screen_name: 'fourlastor',
            retweeted_status: '1234',
            user: {
                id_str: '456',
                name: 'roborbio',
                profile_image_url_https: 'https://an.image',
                screen_name: 'Robertosss'
            }
        })

        expect(result).toBe(false)
    })

    it("Does not filter out tweets without retweeted_status", () => {
        const result = excludeRetweets({
            id_str: '123',
            created_at: '2018-01-25',
            full_text: 'banana',
            display_text_range: [1,2],
            entities: {
                hashtags: [],
                media: [],
                urls: [],
                user_mentions: []
            },
            retweeted_status: undefined,
            in_reply_to_screen_name: 'fourlastor',
            user: {
                id_str: '456',
                name: 'roborbio',
                profile_image_url_https: 'https://an.image',
                screen_name: 'Robertosss'
            }
        })

        expect(result).toBe(true)
    })

    it("Does not filter out tweets with null retweeted_status", () => {
        const result = excludeRetweets({
            id_str: '123',
            created_at: '2018-01-25',
            full_text: 'banana',
            display_text_range: [1,2],
            entities: {
                hashtags: [],
                media: [],
                urls: [],
                user_mentions: []
            },
            retweeted_status: null,
            in_reply_to_screen_name: 'fourlastor',
            user: {
                id_str: '456',
                name: 'roborbio',
                profile_image_url_https: 'https://an.image',
                screen_name: 'Robertosss'
            }
        })

        expect(result).toBe(true)
    })
})
