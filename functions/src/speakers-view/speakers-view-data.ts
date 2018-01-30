import { Optional } from "../optional";

export interface SpeakerPage {
    readonly id: string
    readonly name: string
    readonly bio: string
    readonly companyName: Optional<string>
    readonly companyUrl: Optional<string>
    readonly personalUrl: Optional<string>
    readonly photoUrl: Optional<string>
    readonly twitterUsername: Optional<string>
}
