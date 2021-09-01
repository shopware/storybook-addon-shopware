const clone = require('clone');
const docgen = require('vue-docgen-api');
const loaderUtils = require('loader-utils');

const parser = require('./parse-additional-files');

const inject = require('./inject');
const { filterDescriptors } = require('./utils');

const defaultOptions = {
    injectAt: '__docgenInfo',
};

module.exports = async function (content, map) {
    const callback = this.async();
    const filePath = map.sources[0];

    // If we're dealing with a story, skip parsing
    if (!filePath || filePath.includes('.stories.js')) {
        callback(null, content, map);
        return;
    }

    try {
        const options = {
            ...defaultOptions,
            ...(clone(loaderUtils.getOptions(this)) || {}),
        };

        // Replace Shopware's component registration with a regular `export default`
        const parsedSource = transformSource(content);

        const allInfo = [].concat(
            await docgen.parseSource(parsedSource, filePath)
        );

        const { extractTwigBlocks, extractVueSlots } = parser(
            parsedSource,
            filePath
        );

        const extractedSlots = extractVueSlots().map((slot) => {
            return { name: slot.name, default: slot.isDefault };
        });

        const filteredInfo = allInfo.map((info) => {
            if (!info.slots || !info.slots.length) {
                info.slots = [];
            }

            return {
                ...info,
                props: filterDescriptors(
                    info.props,
                    (prop) => !isIgnoredDescriptor(prop)
                ),
                events: filterDescriptors(
                    info.events,
                    (ev) => !isIgnoredEvent(ev)
                ),
                slots: filterDescriptors(
                    [...info.slots, ...extractedSlots],
                    (slot) => !isIgnoredDescriptor(slot)
                ),
                twigBlocks: extractTwigBlocks(),
            };
        });

        callback(
            null,
            inject(parsedSource, filteredInfo, options.injectAt),
            map
        );
    } catch (e) {
        if (e instanceof Error) {
            e.message =
                `[storybook-sw-js-loader] failed to parse the component file ${filePath} with docgen-api: ${e.message}`
                e.message;
        }

        this.emitWarning(e);
        callback(null, content, map);
    }
};

function isIgnoredDescriptor(descriptor) {
    return descriptor.tags && descriptor.tags.ignore;
}

function isIgnoredEvent(eventDescriptor) {
    return (
        eventDescriptor.tags &&
        eventDescriptor.tags instanceof Array &&
        eventDescriptor.tags.find((t) => t.title === 'ignore')
    );
}

function getComponentRegistrationType(content) {
    if (content.includes('Component.register')) {
        return 'register';
    }
    if (content.includes('Component.extend')) {
        return 'extend';
    }
    if (content.includes('Component.override')) {
        return 'override';
    }

    return null;
}

function transformSource(source) {
    const type = getComponentRegistrationType(source);

    if (type === 'register') {
        source = source.replace(
            /Component\.register\('(.*)',?.{/,
            "export default { \n  name: '$1',"
        );

        source = source.replace(/\n\}\);$/gm, '\n};');

        return source;
    }

    if (type === 'extend') {
        source = source.replace(
            /Component\.extend\('(.*)',?.'(.*)',?.{/,
            "export default { \n  name: '$1',\n  extends: '$2',"
        );

        source = source.replace(/\n\}\);$/gm, '\n};');
    }

    return source;
}
