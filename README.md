# Storybook addon for Shopware

The addon provides helpers and loaders to integrate the Shopware 6 administration with Storybook. It contains multiple parts - a loader, an addon panel and a renderer.

The loader is based on [VueDocgenApi](https://www.npmjs.com/package/vue-docgen-api?activeTab=readme) which is a toolkit to extract informations like events, slots, methods, properties etc. from Vue components. The loader itself transforms the JavaScript files from Shopware in `export default` to work together with VueDocgenApi.

The provided renderer allows to easily create stories in Storybook using Shopware components. It covers all the necessary parts to write efficent documentation without the need of any boilerplate code.

Last but not least the addon comes with an addon panel which displays the source code of all available Twig blocks inside a component. This way you'll find exactly the part of the code you want to override in your code to provide additional functionality.

## The renderer

The renderer is the heart of the addon. It provides methods to create a default story, provide additional stories for the different variants of a component and allows to easily customize the template used for the story itself.

### How to use the renderer

The renderer can easily be imported in your story using the following code snippet:

```js
import { getRenderer } from '@shopware-ag/storybook-addon-shopware/renderer';
```

The function `getRenderer` accepts a configuration object for the component:

| Option  | Description  | Optional |
|---|---|---|
| `title`  | Provides the name and the navigation structure of the component  | ❌ |
|  `component` | Main Vue.js component for all story variants within the story file |  ❌ | 
|  `additionalComponents` | Additional Vue.js components which are used within the main Vue.js component. If the main component extends another component, please provide it here. |  ✅ |
| `template` | Template literal with the HTML markup to render the story. Default: `<[component-name] v-bind="$props"></[component-name]>` | ✅ | 
| `figmaUrl` | URL to a figma design which will be displayed in the Design tab | ✅ | 

The method `getRenderer` returns an object with the following methods:

| Method |  Description | Arguments |
|--------|--------------|---
| `getDefaultStory()` | Provides the default story which is mandatory in Storybook. | *none*
| `getStory()` | Provides the story which gets displayed to the user and shows of a certain variant / combination of properties of the component. | <ul><li>`args` - Preconfigured properties of the component</li><li>`template` - a different template for the component. Useful to document slots and their behavior</li></ul> |
| `getTemplate()` | Returns the configured template instance from the method `getRenderer`| *none* |
| `getCustomTemplate()` | Helper method which provides a template instance to use as the second argument of the method `getStory()` | <ul><li>`template` - template literal of the template</li></ul> |

The following example shows the minimal set of arguments provided to method `getRenderer()`:

```js
import { getRenderer } from '@shopware-ag/storybook-addon-shopware/renderer';
import Icon from 'src/app/component/base/sw-icon';

const { getDefaultStory, getStory } = getRenderer({
    title: 'Basic / sw-icon',
    component: Icon,
});
```

### Writing stories

First and foremost Storybook requires an `export default` with a default story. The default story needs to contain the title of the story, the necessary component as well as additional components if necessary. We can use the method `getDefaultStory` which is getting returned from `getRenderer` to provide the default story:

```js
export default getDefaultStory();
```

Next up we can write the stories using the `getStory` method. The easiest way to use the method is export a named constant and provide the return value from `getStory()` as the value:

```js
export const Default = getStory();
```

Usually this isn't quite enough, we would like to provide preconfigured properties which we can provide as the first argument of the method:

```js
export const Default = getStory({
    name: 'default-chart-sales',
    color: '#4DC6E9',
});
```

Storybook recommends the use of *UpperCamelCase* for your story exports. For example `VerticalTabs` will be rendered as `Virtual Tabs` in the navigation structure.

### Writing multiple stories

When we're writing multiple stories for a component we usually want to re-use configured properties of a previous story and just add new properties or modify existing properties here. This can be easiliy done using the rest operator in JavaScript.

```js
export const Color = getStory({
    color: '#A092F0',
    firstName: 'John',
    lastName: 'Doe',
    size: '48px',
});

export const Square = getStory({ ...Color.args, ...{ variant: 'square' } });

export const Image = getStory({ ...Color.args,
...{
    imageUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
} });
```

### Using a custom template

Vue.js is heavily relying on slots for content distribution. Using the method `getCustomTemplate()` we can provide a custom template:

```js
import { getRenderer } from '@shopware-ag/storybook-addon-shopware/renderer';

import Icon from 'src/app/component/base/sw-icon';
import Button from 'src/app/component/base/sw-button';
import EmptyState from 'src/app/component/base/sw-empty-state';

const { getDefaultStory, getStory, getCustomTemplate } = getRenderer({
    title: 'Basic / sw-empty-state',
    component: EmptyState,
    additionalComponents: [
        Icon,
        Button,
    ],
});

export default getDefaultStory();

export const Default = getStory({
    color: '#F88962',
    title: 'No experiment found',
    subline: `Lorem ipsum dolor sit amet, consectetur adipisicing elit. Atque consequatur consequuntur debitis dolore 
            dolorum earum exercitationem expedita ipsam iste iusto officia, officiis quae ratione recusandae reiciendis.
            Earum, ipsam, rerum? Earum.`,
    icon: 'default-object-lab-flask',
    emptyModule: true,
});

export const AdditionalActionButtons = getStory({ ...Default.args, ...{ color: '#57D9A3' } }, getCustomTemplate(`
    <sw-empty-state v-bind="$props">
        <template #actions>
            <sw-button>Click me!</sw-button>
        </template>    
    </sw-empty-state>
`));

```

### Using automatic property bindings in template literals:

When you're writing a template to use within a story you can use the power of VueDocgenApi. Provide the markup the way you want and just make sure you're providing the automatic property bindings using `v-bind` like in the following example:

```html
<sw-button v-bind="$props"></sw-button>
```

### Providing additional controls which are not defined in a component

Additionally it's possible to provide additional controls for your story to customize the behavior of the component even more.  In the following example we're providing an additional control called `content` which is filling the default slot of the `sw-card` component:

```js
const { getDefaultStory, getStory } = getRenderer({
    title: 'Basic / sw-card',
    component: Card,
    additionalComponents: [
        Loader,
    ],
    template: `<sw-card v-bind="$props">{{ content }}</sw-card>`,
});

export default getDefaultStory();

export const CardWithTitle = getStory({
    title: 'Example card',
    content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. A aliquam asperiores aut consectetur cum cumque'
});
```
