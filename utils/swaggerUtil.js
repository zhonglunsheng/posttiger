function swagger2ApiJson(data) {
  let projectName = data.data?.project?.name || "";

  console.log(projectName);

  let apis = [];

  for (let api of data.data?.apis || []) {
    let tagApiList = [];
    let list = api.target_type === "folder" ? api.children : [api];
    let tagName = api.target_type === "folder" ? api.name : "";
    for (let item of list) {
      let queryParams = item.request?.query || [];

      let queryJson = {};
      for (let queryParam of queryParams) {
        queryJson[queryParam.key] = queryParam.value;
      }

      let headerParams = item.request?.header || [];

      let headerJson = {};
      for (let headerParam of headerParams) {
        headerJson[headerParam.key] = headerParam.value;
      }

      let requestBodyRow = item.request?.body?.raw || "";
      if (requestBodyRow) {
        try {
          let temp = JSON.parse(requestBodyRow);
          if (typeof temp === "string") {
            requestBodyRow = temp;
          }
        } catch (e) {
          // ignore
        }
      }

      let apiInfo = {};
      apiInfo["url"] = item.url;
      apiInfo["method"] = item.method;
      console.log(item.name, item.description, item);
      apiInfo["label"] =
        item.name === "新建接口" ? item.description || item.name : item.name;
      apiInfo["queryParams"] =
        typeof queryJson === "string"
          ? queryJson
          : JSON.stringify(queryJson, null, 2);
      apiInfo["requestBody"] = requestBodyRow;
      apiInfo["headers"] = JSON.stringify(headerJson, null, 2);
      tagApiList.push(apiInfo);
    }

    let obj = {};
    obj[tagName] = tagApiList;
    apis.push(obj);
  }
  return apis;
}
//
// const test = async () => {
//     const convertResult= await converter.convert("http://localhost:9096/v2/api-docs");
//     // console.log(convertResult);
//     let apis = swagger2ApiJson(convertResult)
//     console.log(apis)
// }
// test()

module.exports = {
  swagger2ApiJson,
};

// console.log(apis)
