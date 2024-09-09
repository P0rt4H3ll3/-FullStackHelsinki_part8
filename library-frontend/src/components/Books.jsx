import { useQuery } from '@apollo/client'
import { BOOKS_ALL } from '../queries'
import { useState } from 'react'
import GenreFilter from './GenreFilter'

const Books = (props) => {
  const [filter, setFilter] = useState('')
  const { loading, error, data } = useQuery(BOOKS_ALL)

  if (loading) return <div>loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!data || !data.allBooks) return <div>No books found.</div>

  const genres = Array.from(new Set(data.allBooks.flatMap((b) => b.genres)))
  const subTitle = !filter ? 'all books' : `books filtered by genre : ${filter}`
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
          {data.allBooks
            .filter((a) => {
              if (!filter) {
                return true
              } else {
                return a.genres.includes(filter)
              }
            })
            .map((a) => (
              <tr key={a.title}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            ))}
        </tbody>
      </table>
      <GenreFilter genres={genres} setFilter={setFilter} />
    </div>
  )
}

export default Books
