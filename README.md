# js-rain: Simple rain animations with web components

This project was an exploration of
[Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
and the
[Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
to add simple stylized rain to web pages with minimal setup.

You can see a demo of this effect [here](https://auranym.github.io/js-rain/demo/demo.html).

## Setup

Add the minified scripts found in the [build directory](/build)
to your page (via a `<script>` tag, downloading directly, etc).

Now you can use the following web components like standard `HTML` elements.

## Usage

### `<rain-background>`

Place anywhere within the page's `<body>` and a rain animation will be started.
It will automatically adjust to your page's height and width. No extra setup
is required!

You can optionally specify the color of the droplets with the attributes
`color1` and `color2`.

#### Example

```html
<rain-background color1="#ffffff60" color2="#738ca060"></rain-background>
```

### `<splash-container>`

This component animates simple splashes at the bottom of its specified area.
You should specify this area with CSS (through a stylesheet or with the `style`
attribute). This component behaves similarly to a `<div>`, and the animation
continues to work as the container is resized.

You should also define the number of splashes to display simultaneously with the
`splashes` attribute.
Due to performance reasons, this should be a smaller number (8 or less). However,
you can have multiple `<splash-containers>` with minimal performance loss.

Optionally, you can define the color of the splashes with the `color` attribute.

#### Example

```html
<splash-container splashes="4" color="#738ca0"></splash-container>
```

## Improvements

- Use a better pseudo-random number generator than `Math.random()` so that splash particles
  do not line up as much.
- Consider using a `<canvas>` instead of SVG masks for splash particles. This would need
  more container-sizing considerations though.
