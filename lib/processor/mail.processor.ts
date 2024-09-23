import { OnQueueActive, OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import Mail, { Address } from 'nodemailer/lib/mailer';
import { MailService } from '../services/mail.service';

@Processor('mails')
export class MailProcessor {
    private logger = new Logger(this.constructor.name);

    constructor(private mailService: MailService) {}

    @Process()
    async handle(job: Job<Mail.Options>) {
        await this.mailService.sendToTransport(job.data);
    }

    private mapAddress(to: string | Address | Array<string | Address> | undefined) {
        if (!to) {
            return '';
        }

        if (Array.isArray(to)) {
            return to.map((address) => (typeof address === 'string' ? address : address.address)).join(',');
        }

        return typeof to === 'string' ? to : to.address;
    }

    @OnQueueActive()
    onActive(job: Job<Mail.Options>) {
        this.logger.debug(`Processing mail job ${job.id} to ${this.mapAddress(job.data.to)}.`);
    }

    @OnQueueCompleted()
    onComplete(job: Job<Mail.Options>) {
        this.logger.debug(`Completed mail job ${job.id} to ${this.mapAddress(job.data.to)}.`);
    }

    @OnQueueFailed()
    onError(job: Job<Mail.Options>, error: Error) {
        this.logger.error(
            `Failed mail job ${job.id} to ${this.mapAddress(job.data.to)}: ${error.message}`,
            error.stack
        );
    }
}
