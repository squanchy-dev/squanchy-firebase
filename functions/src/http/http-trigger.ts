import { Request, Response } from 'express'
import { HttpConfig } from './config'

export const httpTrigger = (callback: () => Promise<any>, config: HttpConfig) => {
    return httpTriggerInternal(callback, errorMessageFor(config))
}

const httpTriggerInternal = (callback: () => Promise<any>, errorMessageProvider: (error: Error) => boolean) =>
    async (_: Request, response: Response) => {
        try {
            await callback()
            response.status(200).send('<h1>🚀 Success</h1>')
        } catch (error) {
            console.error(error)
            const errorMessage = errorMessageProvider(error)
            response.status(500)
                .send(`<h1>❌ Ooops...</h1><p>Something went wrong:</p>` +
                    `<pre width=75% style="margin: 32px; background-color: #eff0f1; padding: 16px; overflow: auto;">` +
                    `${errorMessage}</pre>`)
        }
    }

const errorMessageFor = ({ print_error_details }: HttpConfig) => (error: any) => {
    if (print_error_details) {
        return error.stack
    } else {
        return error
    }
}
