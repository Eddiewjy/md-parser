import getParserInstance from "./src/index";

const md = getParserInstance({
  features: {
    basic: {
      textFormatting: {
        emphasis: true,
        strikethrough: false,
      },
    },
  },
});

const result = md.render(" Hello, ～～word～～  *world*! ");

console.log(result);
