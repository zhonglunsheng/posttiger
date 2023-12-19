import yaml from 'js-yaml'

export const yamlToJson = (yamlStr) => {
  return yaml.load(yamlStr)
}

export const jsonToYarn = (jsonObj) => {
  return yaml.dump(jsonObj)
}
