import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import Mail, { Address } from 'nodemailer/lib/mailer/index.js';
import { MAIL_QUEUE } from '../constants/mailer.constant.js';
import { MailService } from '../services/mail.service.js';

@Processor(MAIL_QUEUE)
export class MailProcessor extends WorkerHost {
    private logger = new Logger(this.constructor.name);

    constructor(private mailService: MailService) {
        super();
    }

    async process(job: Job<Mail.Options>): Promise<void> {
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

    @OnWorkerEvent('active')
    onActive(job: Job<Mail.Options>) {
        this.logger.debug(`Processing mail job ${job.id} to ${this.mapAddress(job.data.to)}.`);
    }

    @OnWorkerEvent('completed')
    onComplete(job: Job<Mail.Options>) {
        this.logger.debug(`Completed mail job ${job.id} to ${this.mapAddress(job.data.to)}.`);
    }

    @OnWorkerEvent('failed')
    onError(job: Job<Mail.Options> | undefined, error: Error) {
        this.logger.error(
            `Failed mail job ${job?.id} to ${this.mapAddress(job?.data.to)}: ${error.message}`,
            error.stack
        );
    }
}
