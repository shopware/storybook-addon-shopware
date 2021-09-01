import Shopware from 'src/core/shopware';
import Vue from 'vue';

/**
 * Builds a Shopware administration and registers it as a global Vue component.
 *
 * @param {object} component
 */
export function build(component) {
    const { name, template } = component;

    const factoryContainer = Shopware.Application.getContainer('factory');
    const templateFactory = factoryContainer.template;

    templateFactory.registerComponentTemplate(name, template);
    templateFactory.resolveTemplates();
    component.template = templateFactory.getRenderedTemplate(name);
    templateFactory.getNormalizedTemplateRegistry().clear();

    Vue.component(name, component);

    return component;
}

/**
 * Creates a renderer for Storybook stories.
 *
 * @param {Object} options
 * @param {VueComponent} options.component
 * @param {string} options.title
 * @param {VueComponent[]} options.additionalComponents
 * @param {string} options.template
 * @param {array} options.decorators
 */
export function getRenderer(options) {
    const mainComponentName = options.component.name;
    if (!options.additionalComponents) {
        options.additionalComponents = [];
    }

    const additionalComponents = options.additionalComponents.reduce(
        (acc, component) => {
            const builtComponent = build(component);
            acc[component.name] = builtComponent;
            return acc;
        },
        { [mainComponentName]: options.component }
    );

    // If no template is not present, we create a default template
    if (!options.template || options.template.length <= 0) {
        options.template = `<${mainComponentName} v-bind="$props"></${mainComponentName}>`;
    }

    if (options.component.extends && options.component.extends.length > 0) {
        const extendedComponentName = options.component.extends;
        const extendedComponent = options.additionalComponents.reduce(
            (acc, component) => {
                if (component.name === extendedComponentName) {
                    acc = component;
                }
                return acc;
            },
            null
        );

        if (!extendedComponent) {
            console.log(
                `[storybook-sw-js-loader]`,
                `Extended component ${extendedComponentName} not found in options.additionalComponents.`,
                options.additionalComponents
            );

            return;
        }

        options.component.extends = extendedComponent;
    }

    const component = build(options.component);

    // Parses figma url
    const parameters = {};
    if (options.figmaUrl && options.figmaUrl.length) {
        parameters.design = {
            type: 'figma',
            url: options.figmaUrl
        };
    }

    /**
     * Creates a custom template using the provided template string which is necessary
     * to reuse a template string including their args in storybook.
     *
     * @param {string} template
     */
    const getCustomTemplate = (template) => {
        return (args, { argTypes }) => ({
            components: additionalComponents,
            props: Object.keys(argTypes),
            template: template,
        });
    };

    const Template = getCustomTemplate(options.template);

    return {
        /**
         * Returns the default story for storybook. It sets the component title, the argTypes,
         * remaps the special `validValues` to a radio selection and registers necessary decorators.
         *
         * ```
         * export default getDefaultStory();
         * ```
         */
        getDefaultStory() {
            const title = options.title || mainComponentName;

            const argTypes = Object.keys(options.component.props).reduce(
                (acc, propName) => {
                    const prop = options.component.props[propName];

                    if (
                        !Object.prototype.hasOwnProperty.call(
                            prop,
                            'validValues'
                        )
                    ) {
                        return acc;
                    }

                    acc[propName] = {
                        control: {
                            options: prop.validValues,
                            type: 'radio',
                        },
                    };

                    return acc;
                },
                options.argTypes || {}
            );

            return {
                component,
                title,
                argTypes,
            };
        },

        /**
         * Returns a story based on the provided template.
         *
         * ```
         * export const Default = getStory();
         * ```
         *
         * @param {object} args
         * @param {Function} template
         */
        getStory(args, template = Template) {
            const story = template.bind({});
            story.args = args;

            story.parameters = parameters;

            return story;
        },

        /**
         * Gets the storybook default template for the component.
         * @returns {Function}
         */
        getTemplate() {
            return Template;
        },

        getCustomTemplate: getCustomTemplate,
    };
}
