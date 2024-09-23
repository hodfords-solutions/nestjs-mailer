import { DynamicModule, Global, Module, Provider, ValueProvider } from '@nestjs/common';
import { MailContentService } from './services/mail-content.service';
import { MailService } from './services/mail.service';
import { MailerOptions } from './interfaces/mailer-options.interface';
import { MAILER_OPTIONS } from './constants/mailer.constant';
import { BullModule } from '@nestjs/bull';
import { MailProcessor } from './processor/mail.processor';
import { MailerAsyncOptions } from './interfaces/mailer-options-async.interface';
import { MailerOptionsFactory } from './interfaces/mailer-options-factory.interface';

@Global()
@Module({})
export class MailerModule {
    public static forRoot(options: MailerOptions): DynamicModule {
        const mailerOptionsProvider: ValueProvider<MailerOptions> = {
            provide: MAILER_OPTIONS,
            useValue: options
        };

        return {
            imports: [
                BullModule.registerQueue({
                    name: 'mails'
                })
            ],
            module: MailerModule,
            providers: [mailerOptionsProvider, MailService, MailContentService, MailProcessor],
            exports: [MailService, MailContentService]
        };
    }

    public static forRootAsync(options: MailerAsyncOptions): DynamicModule {
        const providers = [...this.createAsyncProviders(options), MailService, MailContentService, MailProcessor];
        const { imports: inputImports = [] } = options;
        const imports = [
            ...inputImports,
            BullModule.registerQueue({
                name: 'mails'
            })
        ];

        return {
            module: MailerModule,
            imports,
            providers,
            exports: [MailService, MailContentService]
        };
    }

    private static createAsyncProviders(options: MailerAsyncOptions): Provider[] {
        if (options.useExisting || options.useFactory) {
            return [this.createAsyncOptionsProvider(options)];
        }

        const reqProviders = [this.createAsyncOptionsProvider(options)];
        if (options.useClass) {
            reqProviders.push({
                provide: options.useClass,
                useClass: options.useClass
            });
        }

        return reqProviders;
    }

    private static createAsyncOptionsProvider(options: MailerAsyncOptions): Provider {
        if (options.useFactory) {
            return {
                provide: MAILER_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || []
            };
        }

        const injectedType = options.useExisting || options.useClass;
        return {
            provide: MAILER_OPTIONS,
            useFactory: async (optionsFactory: MailerOptionsFactory) => optionsFactory.createMailerOptions(),
            inject: injectedType ? [injectedType] : injectedType
        };
    }
}
