import { useState, useEffect } from 'react'

export default function useForm(initialData) {
  const [data, setData] = useState(initialData)
  const [disabled, setDisabled] = useState(true)

  useEffect(() => {
    setDisabled(!Object.values(data).every(Boolean))
  }, [data])

  const change = ({ target: { name, value } }) => {
    setData({ ...data, [name]: value })
  }

  return { data, change, disabled }
}
