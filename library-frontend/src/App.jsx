import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'

import { Routes, Link, Route } from 'react-router-dom'
import { useState } from 'react'
import Notify from './components/Notify'

const App = () => {
  const [errorMessage, setErrorMessage] = useState('')

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
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
        <Link className="nav-link" to="/add">
          add book
        </Link>
      </div>
      <div>
        <Notify errorMessage={errorMessage} />
      </div>
      <Routes>
        <Route path="/authors" element={<Authors setError={notify} />} />
        <Route path="/books" element={<Books />} />
        <Route path="/add" element={<NewBook setError={notify} />} />
      </Routes>

      <div style={{}}>
        <i>Library-App, Department of Computer Science 2024</i>
      </div>
    </div>
  )
}

export default App
