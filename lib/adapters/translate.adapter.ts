import { escapeRegExp } from 'lodash';
import { BaseMail } from '../mails/base.mail';
import { BaseViewAdapter } from './base-view.adapter';
import { ParseTransTagType } from '../types/parse-trans-tag.type';

export class TranslateAdapter extends BaseViewAdapter {
    constructor(private trans: (...args: unknown[]) => string) {
        super();
    }

    render(mail: BaseMail): string {
        const content = this.getTemplateContent(mail);
        return this.replaceTranslateContent(content);
    }

    replaceTranslateContent(content: string): string {
        const regex = /<trans[\s\S]+?<\/trans>/g;
        const attributeRegex = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g;

        const matches = content.match(regex);

        if (!matches || !matches.length) {
            return content;
        }

        for (const matchedTag of matches) {
            const { openTag, rawContent } = this.parseTransTag(matchedTag);

            const attributeText = openTag.replace('<trans', '').replace('>', '').trim();

            const attributes = attributeText.match(attributeRegex) || [];
            const attributePairs: Record<string, any> = {};
            for (const attr of attributes) {
                if (!attr) {
                    continue;
                }

                const [key, ...restValue] = attr.split('=');
                attributePairs[key] = restValue.join('=').replace(/"/g, '').trim();
            }

            const translatedValue = this.trans(rawContent, {
                args: attributePairs
            });

            const escapeMatchedTag = escapeRegExp(matchedTag);
            content = content.replace(new RegExp(escapeMatchedTag, 'g'), translatedValue);
        }

        return content;
    }

    private parseTransTag(matchedTag: string): ParseTransTagType {
        const transTagRegex = /(<\s*trans[^>]*>)(.*?)<\s*\/\s*trans>/;
        const transTags = matchedTag.match(transTagRegex);

        if (!transTags) {
            return {
                openTag: '',
                rawContent: matchedTag
            };
        }

        const [, openTag, tagContent] = transTags;
        return {
            openTag,
            rawContent: tagContent.trim()
        };
    }
}
