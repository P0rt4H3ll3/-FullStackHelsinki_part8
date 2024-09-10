import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommendations from './components/Recommendations'

import { Routes, Link, Route, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Notify from './components/Notify'
import { useApolloClient, useSubscription } from '@apollo/client'
import { BOOK_ADDED } from './queries'

const App = () => {
  const [errorMessage, setErrorMessage] = useState('')
  const [token, setToken] = useState(null)
  const client = useApolloClient()
  const navigate = useNavigate()

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      console.log(data.data.bookAdded.title)
      window.alert(`the book '${data.data.bookAdded.title}' was added`)
    }
  })

  useEffect(() => {
    const savedToken = localStorage.getItem('library-user-token')
    if (savedToken) {
      setToken(savedToken)
    }
  }, [client])

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }
  const logout = () => {
    console.log('logout')
    setToken(null)
    localStorage.removeItem('library-user-token')
    client.resetStore()
    navigate('/login')
  }

  return (
    <div>
      <div>
        <Link className="nav-link" to="/authors">
          authors
        </Link>
        <Link className="nav-link" to="/books">
          books
        </Link>
        {!token ? (
          <Link className="nav-link" to="/login">
            login
          </Link>
        ) : (
          <>
            <Link className="nav-link" to="/recommendations">
              recommendations
            </Link>
            <Link className="nav-link" to="/add">
              add book
            </Link>
            <button className="logout" onClick={() => logout()}>
              logout
            </button>
          </>
        )}
      </div>
      <div>
        <Notify errorMessage={errorMessage} />
      </div>
      <Routes>
        <Route
          path="/login"
          element={<LoginForm setToken={setToken} setError={notify} />}
        />
        <Route
          path="/authors"
          element={<Authors setError={notify} token={token} />}
        />
        <Route path={'/'} element={<Books />} />
        <Route path={'/books'} element={<Books />} />
        <Route path="/add" element={<NewBook setError={notify} />} />
        <Route path="/recommendations" element={<Recommendations />} />
      </Routes>

      <div style={{}}>
        <i>Library-App, Department of Computer Science 2024</i>
      </div>
    </div>
  )
}

export default App
