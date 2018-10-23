const TWO_SPACES = 2

export const asDebugJsonString = (value: any) => {
    return JSON.stringify(value, jsonMetadataMuter, TWO_SPACES)
}

const jsonMetadataMuter = (key: any, value: any) => {
    // Filtering out noisy internal Firestore properties
    if (key === '_firebase' || key === '_referencePath') {
        return undefined
    }
    return value
}
