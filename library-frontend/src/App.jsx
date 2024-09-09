import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'

import { Routes, Link, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Notify from './components/Notify'
import { useApolloClient } from '@apollo/client'

const App = () => {
  const [errorMessage, setErrorMessage] = useState('')
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }
  const logout = () => {
    console.log('logout')
    setToken(null)
    window.localStorage.removeItem('library-user-token')
    client.resetStore()
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
        <Route
          path="/add"
          element={
            token ? (
              <NewBook setError={notify} />
            ) : (
              <LoginForm setToken={setToken} setError={notify} />
            )
          }
        />
      </Routes>

      <div style={{}}>
        <i>Library-App, Department of Computer Science 2024</i>
      </div>
    </div>
  )
}

export default App
