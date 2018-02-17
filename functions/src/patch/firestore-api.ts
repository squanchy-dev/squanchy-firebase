export interface FirestoreApiBody {
    fields: Fields
}

export type FieldValue =
    StringValue |
    BooleanValue |
    ArrayValue |
    IntegerValue |
    DoubleValue |
    MapValue |
    NullValue |
    ReferenceValue |
    TimestampValue

export interface StringValue {
    'stringValue': string
}

export interface BooleanValue {
    'booleanValue': string
}

export interface ArrayValue {
    'arrayValue': {
        values: FieldValue[]
    }
}

export interface IntegerValue {
    'integerValue': number
}

export interface DoubleValue {
    'doubleValue': number
}

export interface MapValue {
    'mapValue': {
        fields: Fields
    }
}

export interface Fields {
    [fieldName: string]: FieldValue
}

export interface NullValue {
    'nullValue': null
}

export interface ReferenceValue {
    'referenceValue': string
}

export interface TimestampValue {
    'timestampValue': number
}
