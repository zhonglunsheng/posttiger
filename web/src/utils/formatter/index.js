import prettier from "prettier/standalone"
import * as parserBabel from "prettier/parser-babel"
import * as estreePlugin from "prettier/plugins/estree"
import * as parserHtml from "prettier/parser-html"
import * as parserMarkdown from "prettier/parser-markdown"
import { format as formatSql } from "sql-formatter"

export const format = (language, data) => {
  let result

  try {
    console.log(language)

    let parseType = language

    if (language.includes("sql")) {
      parseType = "sql"
    }
    switch (parseType) {
      case "javascript":
        result = prettier.format(data, {
          semi: false,
          parser: "babel",
          plugins: [parserBabel, estreePlugin],
        })
        break
      case "json":
        result = prettier.format(data, {
          parser: "json",
          plugins: [parserBabel, estreePlugin],
          quoteProps: "preserve",
          trailingComma: "none",
          printWidth: 1,
        })
        break
      case "html":
        result = prettier.format(data, {
          plugins: [parserHtml],
          parser: "html",
        })
        break
      case "markdown":
        result = prettier.format(data, {
          plugins: [parserMarkdown],
          parser: "markdown",
        })
        break
      case "sql":
        result = formatSql(data, {
          language: language || "sql",
        })
        console.log(result)
        return new Promise((resolver) => {
            return resolver(result)
        })
        break
      case "vue":
        result = prettier.format(data, {
          plugins: [parserHtml],
          parser: "vue",
        })
        break
      default:
        break
    }
    console.log(result)
  } catch (error) {
    console.log(error)
    throw error
  }

  return result
}