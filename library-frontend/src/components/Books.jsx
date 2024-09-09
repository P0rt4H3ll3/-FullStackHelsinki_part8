import { useQuery } from '@apollo/client'
import { BOOKS_ALL } from '../queries'
import { useState, useEffect } from 'react'
import GenreFilter from './GenreFilter'

const Books = () => {
  const [filter, setFilter] = useState('')
  const [allGenres, setAllGenres] = useState([])

  const {
    loading: genresLoading,
    error: genresError,
    data: genresData
  } = useQuery(BOOKS_ALL)

  useEffect(() => {
    if (genresData && genresData.allBooks) {
      const genres = Array.from(
        new Set(genresData.allBooks.flatMap((b) => b.genres))
      )
      setAllGenres(genres)
    }
  }, [genresData])

  const { loading, error, data, refetch } = useQuery(BOOKS_ALL, {
    variables: { genre: filter || null }
  })

  const handleGenre = (newGenre) => {
    setFilter(newGenre)
    refetch({ genre: newGenre || null })
  }

  if (loading || genresLoading) return <div>loading...</div>
  if (error || genresError)
    return <div>Error: {error?.message || genresError?.message}</div>
  if (!data || !data.allBooks) return <div>No books found.</div>

  const subTitle = !filter ? 'all books' : `books filtered by genre: ${filter}`

  return (
    <div>
      <h2>books</h2>
      <h3>{subTitle}</h3>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {data.allBooks.map((book) => (
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <GenreFilter genres={allGenres} setFilter={handleGenre} />
    </div>
  )
}

export default Books
