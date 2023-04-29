# Arrow Tags

Tags for [ArrowJS](https://www.arrow-js.com/) without HTML syntax. This allows a convenient way to pass multiple HTML attributes, and use reactive data directly within the arrow functions.

```js
import { reactive, html } from '@arrow-js/core';
import { arrowTags } from 'arrow-tags';

const data = reactive({ i: 0 });
const { button } = arrowTags(html);
button`${({ i }) => ['on', 'off'][i % 2]}`({
  data, style: 'color: blue;',
  "@click": () => data.i += 1
})(el);
```

The above is new syntax for this ArrowJS code:

```js
import { reactive, html } from '@arrow-js/core';

const data = reactive({ i: 0 });
html`<button style="color: blue;" @click="${() => data.i += 1}">
  ${() => ['on', 'off'][data.i % 2]}
</button>`(el);
```

## Dependencies 

```js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

```

## Basic Example

Pass contents, attributes, then html element

```js
import { html } from '@arrow-js/core';
import { arrowTags } from 'arrow-tags';
const greeting = 'Hello';
const style = 'color: red;';
// Render a span with red text to the DOM
const el = document.getElementById('root');
arrowTags(html).span`${greeting}`({ style })(el);
```

## Reactive contents

Pass reactive contents that update interactively

```js
import { reactive, html } from '@arrow-js/core';
import { arrowTags } from 'arrow-tags';
const data = reactive({ i: 0 });
const onClick = () => data.i += 1;
const greetings = ['Hello', 'Goodbye'];
const toGreeting = ({ i }) => greetings[i % 2];
const props = { data, "@click": () => data.i += 1 };
// The button greeting reacts to user input
const el = document.getElementById('root');
arrowTags(html).button`${toGreeting}`(props)(el);
```

## Reactive styles

Pass attributes that update interactively

```js
import { reactive, html } from '@arrow-js/core';
import { arrowTags } from 'arrow-tags';
const data = reactive({ i: 0 });
const onClick = () => data.i += 1;
const colors = ['red', 'pink'];
const toColors = ({ i }) => colors[i % 2];
const style = d => `color: ${toColors(d)};`;
// The button color reacts to user input
const el = document.getElementById('root');
arrowTags(html).button`Hello`({
   data, style, "@click": () => data.i += 1
})(el);
```
