import { BOOKS_ALL, ME } from '../queries'
import { useQuery } from '@apollo/client'
import { Link } from 'react-router-dom'

const Recommendations = (props) => {
  const { loading: myLoading, error: myError, data: myData } = useQuery(ME)

  const favoriteGenre = myData?.me?.favoriteGenre

  const { loading, error, data } = useQuery(BOOKS_ALL, {
    variables: { genre: favoriteGenre }
  })
  if (loading || myLoading) return <div>loading...</div>
  if (error || myError) return <div>Error: {error.message}</div>
  if (!data || !data.allBooks || !myData || !myData.me)
    return <div>No books found.</div>

  return (
    <div>
      <h2>Recommendations</h2>
      <h3>Books in your favorite genre: {favoriteGenre}</h3>
      <table>
        <tbody>
          <tr>
            <th>title</th>
            <th>author</th>
            <th>published</th>
          </tr>

          {data?.allBooks?.length === 0 && !loading ? (
            <tr>
              <td>
                At the moment there are no books by your favorit genre available{' '}
                <br />
                why dont you add your favorite book
                <Link to="/add"> here</Link>?
              </td>
            </tr>
          ) : (
            <>
              {data?.allBooks?.map((a) => (
                <tr key={a.title}>
                  <td>{a.title}</td>
                  <td>{a.author.name}</td>
                  <td>{a.published}</td>
                </tr>
              ))}
            </>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Recommendations
