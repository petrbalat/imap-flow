// @deno-types="npm:@types/imapflow@1.0.19"
import { ImapFlow } from "npm:imapflow@1.0.164";
import { extract, type LetterparserMail } from "npm:letterparser@0.1.8";
import type { FetchQueryObject, Connection, FetchMessageObject } from "./types.ts";
import {LetterparserMailEx} from "./types.ts";

/**
 * connect ImapFlow. Dont forget to call client.logout();
 *
 * @see https://imapflow.com/module-imapflow-ImapFlow.html
 * @param connection
 * @return use
 */
export async function connect(
    connection: Connection,
): Promise<ImapFlow> {
    const client = new ImapFlow({
        host: connection.host,
        port: connection.port,
        secure: connection.secure,

        auth: {
            user: connection.user,
            pass: connection.pass,
        },
    });

    // https://imapflow.com/module-imapflow-ImapFlow.html
    await client.connect();
    return client;
}

/**
 * list inbox emails
 *
 * @param connection
 * @param range
 * @param envelope
 */
export async function listInboxMails(
    connection: Connection,
    range?: FetchQueryObject,
    envelope = true,
): Promise<Array<FetchMessageObject>> {
    const client = await connect(connection);
    const lock = await client.getMailboxLock("INBOX");
    let list:Array<FetchMessageObject> = []
    try {
        const fetch = client.fetch(range ?? "1:*", {uid: true, envelope});
        list = (await Array.fromAsync(fetch)) as any;
    } finally {
        lock.release();
        await client.logout();
    }
    return list;
}

/**
 * downloadEmails
 *
 * @param connection
 * @param seqs
 */
export async function* downloadEmails(
    connection: Connection,
    seqs: Array<number>,
): AsyncGenerator<LetterparserMailEx> {
    const client = await connect(connection);
    const lock = await client.getMailboxLock("INBOX");

    try {
        for (const seq of seqs) {
            const single = await client.fetchOne(seq.toString(), {source: true, uid: true});
            if (!single.source) continue;

            const parseMail: LetterparserMail = extract(single.source.toString());
            yield {...parseMail, uid: single.uid, seq: single.seq};
        }
    } finally {
        lock.release();
        await client.logout();
    }
}

if (import.meta.main) {
    const connection: Connection = {
        host: Deno.env.get("EMAIL_HOST")!,
        port: +(Deno.env.get("EMAIL_PORT") ?? "993"),
        secure: (Deno.env.get("EMAIL_TLS") ?? "true") === "true",
        user: Deno.env.get("EMAIL_USER")!,
        pass: Deno.env.get("EMAIL_PASSWORD")!,
    };

    const emailToDownload = await listInboxMails(connection);
    console.log(emailToDownload)

    const seqs: number[] = emailToDownload.map((it) => it.seq);
    for await (const mail of downloadEmails(connection, seqs)) {
        console.log(mail);
    }
}
