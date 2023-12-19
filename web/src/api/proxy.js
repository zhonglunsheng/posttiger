import request from '@/utils/request'

//发送请求
export const sendApi = (data) => {
  let url = data.url.replace('http://', '').replace('https://', '')
  let index = url.indexOf('/')
  let headers = {}
  headers['x-dynamic-target'] = data.url.slice(0, data.url.indexOf('/', 8))

  const options = {
    method: data.method,
    headers: headers,
    data: {
      requestBody: data.requestBody,
      headers: data.headers,
      method: data.method,
      url: data.url,
      queryParams: data.queryParams,
    },
    url: 'http://localhost:3000/proxy',
    params: data.queryParams,
  }
  return request(options)
}
