import { useState, useEffect } from 'react'

/*

How to use this hook:
import useMediaQuery from './hooks/useMediaQuery';

function App() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return ();
};

*/

const useMediaQuery = (query: string = '(max-width: 768px)') => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches)

  useEffect(() => {
    const media = window.matchMedia(query)
    const listener = () => setMatches(media.matches)

    media.addListener(listener)
    return () => media.removeListener(listener)
  }, [query])

  return matches
}

export default useMediaQuery
