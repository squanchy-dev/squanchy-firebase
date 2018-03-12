/* tslint:disable max-line-length */

import { FirebaseApp } from '../firebase'
import {
    ArrayValue,
    BooleanValue,
    DoubleValue,
    Fields,
    FieldValue,
    IntegerValue,
    MapValue,
    NullValue,
    ReferenceValue,
    StringValue,
    TimestampValue
} from './firestore-api'
import { mapObject } from '../objects'

export const mapFields = (app: FirebaseApp, vendorName: string) => (fields: Fields): { [key: string]: any } => {
    return mapObject(fields, field => mapField(app, vendorName)(field))
}

const mapField = (app: FirebaseApp, vendorName: string) => (field: FieldValue): any => {
    if (isString(field)) {
        return field.stringValue
    } else if (isBoolean(field)) {
        return field.booleanValue
    } else if (isArray(field)) {
        return field.arrayValue.values.map(value => mapField(app, vendorName)(value))
    } else if (isInteger(field)) {
        return field.integerValue
    } else if (isDouble(field)) {
        return field.doubleValue
    } else if (isMap(field)) {
        return mapFields(app, vendorName)(field.mapValue.fields)
    } else if (isNull(field)) {
        return null
    } else if (isReference(field)) {
        const firestore = app.firestore()

        const [, collection, id] = field.referenceValue.split('/')
        return firestore.collection('raw_data').doc(vendorName).collection(collection).doc(id)
    } else if (isTimestamp(field)) {
        return new Date(field.timestampValue)
    } else {
        throw new Error(`Field not supported ${JSON.stringify(field)}`)
    }
}

const isString = (field: FieldValue): field is StringValue => (field as StringValue).stringValue !== undefined
const isBoolean = (field: FieldValue): field is BooleanValue => (field as BooleanValue).booleanValue !== undefined
const isArray = (field: FieldValue): field is ArrayValue => (field as ArrayValue).arrayValue !== undefined
const isInteger = (field: FieldValue): field is IntegerValue => (field as IntegerValue).integerValue !== undefined
const isDouble = (field: FieldValue): field is DoubleValue => (field as DoubleValue).doubleValue !== undefined
const isMap = (field: FieldValue): field is MapValue => (field as MapValue).mapValue !== undefined
const isNull = (field: FieldValue): field is NullValue => (field as NullValue).nullValue !== undefined
const isReference = (field: FieldValue): field is ReferenceValue => (field as ReferenceValue).referenceValue !== undefined
const isTimestamp = (field: FieldValue): field is TimestampValue => (field as TimestampValue).timestampValue !== undefined
