export interface FirestoreApiBody {
    fields: MapValue
}

type FieldValue =
    StringValue |
    BooleanValue |
    ArrayValue |
    IntegerValue |
    DoubleValue |
    MapValue |
    NullValue |
    ReferenceValue |
    TimestampValue

interface StringValue {
    'stringValue': string
}

interface BooleanValue {
    'booleanValue': string
}

interface ArrayValue {
    values: FieldValue[]
}

interface IntegerValue {
    'integerValue': number
}

interface DoubleValue {
    'doubleValue': number
}

interface MapValue {
    fields: {
        [fieldName: string]: FieldValue
    }
}

interface NullValue {
    'nullValue': null
}

interface ReferenceValue {
    'referenceValue': string
}

interface TimestampValue {
    'timestampValue': number
}
