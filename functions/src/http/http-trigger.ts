import { Request, Response } from 'express'
import { shouldPrintErrorDetails, HttpConfig } from './config'

export const httpTrigger = (callback: () => Promise<any>, config: HttpConfig) => {
    return httpTriggerInternal(callback, shouldPrintErrorDetails(config))
}

const httpTriggerInternal = (callback: () => Promise<any>, printErrorDetails: boolean) =>
    async (_: Request, response: Response) => {
        try {
            await callback()
            response.status(200).send('<h1>🚀 Success</h1>')
        } catch (error) {
            console.error(error)
            let errorMessage: string
            if (printErrorDetails) {
                errorMessage = error.stack
            } else {
                errorMessage = error
            }
            response.status(500)
                .send(`<h1>❌ Ooops...</h1><p>Something went wrong:</p>` +
                    `<pre width=75% style="margin: 32px; background-color: #eff0f1; padding: 16px; overflow: auto;">` +
                    `${errorMessage}</pre>`)
        }
    }
