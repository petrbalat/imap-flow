import {LetterparserMail} from "npm:letterparser@0.1.8";

export type FetchMessageObject = {
    uid: number;
    seq: number;
    envelope: MessageEnvelopeObject;
};

export type MessageEnvelopeObject = {
    date: Date;
    subject: string;
    messageId: string;
    inReplyTo?: string;
    from: Array<MessageAddressObject>;
    sender: Array<MessageAddressObject>;
    replyTo: Array<MessageAddressObject>;
    to: Array<MessageAddressObject>;
    cc?: Array<MessageAddressObject>;
    bcc?: Array<MessageAddressObject>;
};

export type MessageAddressObject = {
    name: string;
    address: string;
};

export type Connection = {
    host: string;
    port: number;
    secure: boolean;

    user: string;
    pass: string;
};

export type FetchQueryObject = {
    /**
     * https://imapflow.com/global.html#SequenceString
     */
    seq?: string
    from?: string
    since?: Date
    new?: boolean
}

export type LetterparserMailEx = LetterparserMail & {
    uid: number; seq: number
}