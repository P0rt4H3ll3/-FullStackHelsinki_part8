import { useQuery, useMutation } from '@apollo/client'
import { AUTHORS_ALL, AUTHOR_CHANGE_BORN } from '../queries'
import { useState } from 'react'
import Select from 'react-select'

const Authors = ({ setError }) => {
  const authors = useQuery(AUTHORS_ALL)

  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  const options = authors.data.allAuthors.map((a) => ({
    value: a.name,
    label: a.name
  }))

  const [updateAuthor] = useMutation(AUTHOR_CHANGE_BORN, {
    refetchQueries: [{ query: AUTHORS_ALL }],
    onError: (error) => {
      const message = error.graphQLErrors.map((e) => e.message).join('\n')
      setError(message)
    }
  })

  const submitBorn = async (event) => {
    event.preventDefault()
    console.log('this is the name', name)
    console.log('this is the born ', born)
    updateAuthor({ variables: { name: name.value, setBornTo: born } })
    setName('')
    setBorn('')
  }

  if (authors.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Set birthyear</h2>
      <form onSubmit={submitBorn}>
        <div>
          name{' '}
          <Select defaultValue={name} onChange={setName} options={options} />
        </div>
        <div>
          born{' '}
          <input
            type="number"
            value={born}
            onChange={({ target }) => setBorn(parseInt(target.value))}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

export default Authors
