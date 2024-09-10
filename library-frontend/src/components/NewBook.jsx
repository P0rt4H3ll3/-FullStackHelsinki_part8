import { useMutation } from '@apollo/client'
import { updateCache } from '../helper_functions/updateCache'

import { useState } from 'react'
import { BOOKS_ALL, BOOKS_ADD, AUTHORS_ALL } from '../queries'

const NewBook = ({ setError }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const [createNewBook] = useMutation(BOOKS_ADD, {
    refetchQueries: [{ query: BOOKS_ALL }, { query: AUTHORS_ALL }],
    onError: (error) => {
      const message = error.graphQLErrors.map((e) => e.message).join('\n')
      setError(message)
    },

    update: (cache, { data: { addBook } }) => {
      //deconstruct the response to get direct to addBook new book data
      cache.updateQuery({ query: BOOKS_ALL }, (data) => {
        //Data is fetched from the Apollo Client’s cache
        if (data && data.allBooks) {
          return {
            allBooks: [...data.allBooks, addBook] //append the new book data
          }
        } else {
          return {
            allBooks: [addBook] // in case there is no cache data
          }
        }
      })
    }
  })

  const submit = async (event) => {
    event.preventDefault()
    createNewBook({ variables: { title, published, author, genres } })
    console.log('added book ')
    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <h2>Add a new Book </h2>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(parseInt(target.value))}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook
