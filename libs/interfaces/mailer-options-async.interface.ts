import { ModuleMetadata, Type } from '@nestjs/common';
import { MailerOptionsFactory } from './mailer-options-factory.interface';
import { MailerOptions } from './mailer-options.interface';

export interface MailerAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    inject?: any;
    useExisting?: Type<MailerOptionsFactory>;
    useClass?: Type<MailerOptionsFactory>;
    useFactory?: (...args: any[]) => Promise<MailerOptions> | MailerOptions;
}
