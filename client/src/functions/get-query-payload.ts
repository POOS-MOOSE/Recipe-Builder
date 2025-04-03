const getQueryPayload = (queryStr?: string) => {
  if (!queryStr) {
    console.warn('query string is not defined')
    return {}
  }

  const queryObj: Record<string, string> = {}
  const queryArr = (queryStr[0] === '?' ? queryStr.substring(1, queryStr.length) : queryStr).split('&')

  queryArr.forEach((str) => {
    const [key, val] = str.split('=')

    queryObj[key] = val
  })

  return queryObj
}

export default getQueryPayload
