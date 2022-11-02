import { Attachment } from 'nodemailer/lib/mailer';

export abstract class BaseMail {
    private details: string = '';
    private attachments: Attachment[] = [];

    abstract get subject(): string | Promise<string>;

    abstract get to(): string | string[];

    get from(): string {
        return '';
    }

    public get cc(): string | string[] {
        return [];
    }

    abstract get template(): string;

    public data(): Record<string, any> {
        return {};
    }

    public get options() {
        return {};
    }

    public listAttachments(): Attachment[] {
        return this.attachments;
    }

    public addAttachment(attachment: Attachment) {
        this.attachments.push(attachment);
        return this;
    }

    get content(): string {
        return this.details;
    }

    set content(newContent: string) {
        this.details = newContent;
    }
}
