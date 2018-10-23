export const logAsJsonString = (value: any) => {
    return JSON.stringify(value, jsonMetadataMuter, 2)
}

const jsonMetadataMuter = (key: any, value: any) => {
    // Filtering out noisy internal Firestore properties
    if (key === '_firebase' || key === '_referencePath') {
        return undefined
    }
    return value
}
