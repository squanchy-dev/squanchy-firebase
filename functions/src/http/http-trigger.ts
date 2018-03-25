import { Request, Response } from 'express'

export const httpTrigger = (callback: () => Promise<any>) =>
    async (_: Request, response: Response) => {
        try {
            await callback()
            response.status(200).send('Success')
        } catch (error) {
            console.error(error)
            response.status(500).send('Something went wrong')
        }
    }
