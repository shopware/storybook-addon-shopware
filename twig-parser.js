const Twig = require('twig');
const crypto = require('crypto');
const pretty = require('pretty');

Twig.extend((TwigCore) => {
    /**
     * Remove tokens 2, 3, 4 and 8.
     * This tokens are used for functions and data output.
     * Since the data binding is done in Vue this could lead to syntax issues.
     * We are only using the block system for template inheritance.
     *
     * @type {Array<any>}
     */
    TwigCore.token.definitions = [
        TwigCore.token.definitions[0],
        TwigCore.token.definitions[1],
        TwigCore.token.definitions[5],
        TwigCore.token.definitions[6],
        TwigCore.token.definitions[7],
        TwigCore.token.definitions[9],
        TwigCore.token.definitions[10],
    ];

    /**
     * Twig inheritance extension.
     * The parent function is used as a statement tag.
     * This is used to prevent syntax issues between Twig and Vue.
     * Use `{% parent %}` to print out the parent content of a block.
     */
    TwigCore.exports.extendTag({
        type: 'parent',
        regex: /^parent/,
        next: [],
        open: true,

        parse(token, context, chain) {
            return {
                chain,
                output: TwigCore.placeholders.parent,
            };
        },
    });

    /** Make the placeholders available in the exposed Twig object. */
    TwigCore.exports.placeholders = TwigCore.placeholders;

    /** Make the Twig template cache registry available. */
    TwigCore.exports.getRegistry = function getRegistry() {
        return TwigCore.Templates.registry;
    };

    /** Provide possibility to clear the template cache registry */
    TwigCore.exports.clearRegistry = function clearRegistry() {
        TwigCore.Templates.registry = {};
    };
});

function generateId() {
    return crypto.randomBytes(16).toString('hex');
}

module.exports = (content) => {
    const id = generateId();

    const twigTemplate = Twig.twig({
        id: id,
        data: content,
    });

    const templateBlocks = twigTemplate.render(
        {},
        {
            output: 'blocks',
        }
    );

    return Object.keys(templateBlocks).map((key) => {
        const template = templateBlocks[key];

        return {
            name: key,
            code: pretty(template, { ocd: true }),
        };
    });
};
