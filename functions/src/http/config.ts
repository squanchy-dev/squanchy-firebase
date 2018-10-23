export interface HttpConfig { print_error_details: boolean }

export const shouldPrintErrorDetails = ({ print_error_details }: HttpConfig) => {
    return print_error_details
}
