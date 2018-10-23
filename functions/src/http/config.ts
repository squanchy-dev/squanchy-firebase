export interface HttpConfig { printErrorDetails: boolean }

export const shouldPrintErrorDetails = ({ printErrorDetails }: HttpConfig) => {
    return printErrorDetails
}
