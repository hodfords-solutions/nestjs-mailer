import { OnQueueActive, OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { MailService } from '../services/mail.service';
import { Logger } from '@nestjs/common';
import Mail from 'nodemailer/lib/mailer';

@Processor('mails')
export class MailProcessor {
    private logger = new Logger(this.constructor.name);

    constructor(private mailService: MailService) {}

    @Process()
    async handle(job: Job<Mail.Options>) {
        await this.mailService.sendToTransport(job.data);
    }

    @OnQueueActive()
    onActive(job: Job) {
        this.logger.debug(`Processing mail job ${job.id} to ${job.data.to}.`);
    }

    @OnQueueCompleted()
    onComplete(job: Job) {
        this.logger.debug(`Completed mail job ${job.id} to ${job.data.to}.`);
    }

    @OnQueueFailed()
    onError(job: Job<any>, error: any) {
        this.logger.error(`Failed mail job ${job.id} to ${job.data.to}: ${error.message}`, error.stack);
    }
}
