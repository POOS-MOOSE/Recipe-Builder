const getTokenPayload = (token?: string) => {
  if (!token) {
    console.warn('token is not defined')
    return {}
  }

  const informativePart = token.split('.')[1]
  const payload = JSON.parse(window.atob(informativePart))

  return payload
}

export default getTokenPayload
