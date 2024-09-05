const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v4: uuidv4 } = require('uuid')

let authors = [
  {
    name: 'Robert Martin',
    id: 'afa51ab0-344d-11e9-a414-719c6709cf3e',
    born: 1952
  },
  {
    name: 'Martin Fowler',
    id: 'afa5b6f0-344d-11e9-a414-719c6709cf3e',
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: 'afa5b6f1-344d-11e9-a414-719c6709cf3e',
    born: 1821
  },
  {
    name: 'Joshua Kerievsky', // birthyear not known
    id: 'afa5b6f2-344d-11e9-a414-719c6709cf3e'
  },
  {
    name: 'Sandi Metz', // birthyear not known
    id: 'afa5b6f3-344d-11e9-a414-719c6709cf3e'
  }
]

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: 'afa5b6f4-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: 'afa5b6f5-344d-11e9-a414-719c6709cf3e',
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: 'afa5de00-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: 'afa5de01-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring', 'patterns']
  },
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: 'afa5de02-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: 'afa5de03-344d-11e9-a414-719c6709cf3e',
    genres: ['classic', 'crime']
  },
  {
    title: 'Demons',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: 'afa5de04-344d-11e9-a414-719c6709cf3e',
    genres: ['classic', 'revolution']
  }
]

const typeDefs = `

  type Book {
    title: String!
    author: String!
    published : Int!
    genres: [String]!
    id: ID!
  }

  type Author {
    name: String!
    born : Int
    id: ID!
    bookCount: Int!
  }

  type Query {
    bookCount : Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
    title: String!
    author: String!
    published: Int!
    genres: [String!]!
    ): Book
    editAuthor(
    name: String!, 
    setBornTo: Int!
    ) : Author
  }
`

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      const { author, genre } = args
      return books.filter((book) => {
        //filter => only if something is true is will go to the new array
        let matchA = true
        let matchG = true
        if (author) {
          matchA = book.author === author
          //if not the same author = false
        }
        if (genre) {
          matchG = book.genres.includes(genre)
          // if not includes genre = false
        }
        return matchA && matchG
        //if one of them flase the book that was checked will not be included.
      })
    },
    allAuthors: () => authors
  },
  Author: {
    bookCount: (root) => {
      return books.filter((book) => book.author === root.name).length
    }
  },
  Mutation: {
    addBook: (root, args) => {
      const { title, author, published, genres } = args
      let knownAuthor = authors.find((a) => a.name === author)
      if (!knownAuthor) {
        const newAuthor = {
          name: author,
          id: uuidv4(),
          born: null
        }
        authors.push(newAuthor)
        knownAuthor = newAuthor
      }

      const newBook = {
        title,
        published,
        author: knownAuthor.name,
        id: uuidv4(),
        genres
      }
      books.push(newBook)
      return newBook
    },
    editAuthor: (root, args) => {
      const { name, setBornTo } = args

      let knownAuthor = authors.find((a) => a.name === name)
      if (!knownAuthor) {
        return null
      }

      const updatedAuthor = {
        name: knownAuthor.name,
        id: knownAuthor.id,
        born: setBornTo
      }
      authors = authors.map((author) =>
        author.name === name ? updatedAuthor : author
      )
      return updatedAuthor
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

startStandaloneServer(server, {
  listen: { port: 4000 }
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})