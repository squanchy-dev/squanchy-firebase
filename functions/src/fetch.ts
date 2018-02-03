import { Request, RequestInit, Response } from 'node-fetch'
export type Fetch = (url: string | Request, init?: RequestInit) => Promise<Response>
