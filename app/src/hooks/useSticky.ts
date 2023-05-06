/* eslint-disable */
import { useEffect, useState, useRef } from "react"

function useSticky() {
  const [isSticky, setSticky] = useState(false)
  const element = useRef(null)



  const handleScroll = () => {
    window.scrollY > (window.innerHeight) * 0.2
      ? setSticky(true)
      : setSticky(false)
  }

  // This function handles the scroll performance issue
  const debounce = (func, wait = 20, immediate = true) => {
    let timeOut: string | number | NodeJS.Timeout;
    return () => {
      const later = () => {
        timeOut = null
        if (!immediate) func.apply(this, arguments)
      }
      const callNow = immediate && !timeOut
      clearTimeout(timeOut)
      timeOut = setTimeout(later, wait)
      if (callNow) func.apply(this, arguments)
    }
  }

  useEffect(() => {
    window.addEventListener("scroll", debounce(handleScroll))
    return () => {
      window.removeEventListener("scroll", () => handleScroll)
    }
  }, [debounce, handleScroll])

  return { isSticky, element }
}

export default useSticky