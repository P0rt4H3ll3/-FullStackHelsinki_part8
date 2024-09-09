import { gql } from '@apollo/client'

export const AUTHORS_ALL = gql`
  query allAuthors {
    allAuthors {
      name
      born
      id
      bookCount
    }
  }
`
export const BOOKS_ALL = gql`
  query allBooks {
    allBooks {
      title
      author {
        name
        born
        id
        bookCount
      }
      published
      genres
      id
    }
  }
`
export const COUNT_AUTHORS = gql`
  query authorCount {
    authorCount
  }
`

export const COUNT_BOOKS = gql`
  query bookCount {
    bookCount
  }
`
//---------------------------------------------MUTATIONS-------------------------------------------------

export const BOOKS_ADD = gql`
  mutation addOneBook(
    $title: String!
    $author: String!
    $published: Int!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      author: $author
      published: $published
      genres: $genres
    ) {
      title
      author
      published
      genres
      id
    }
  }
`

export const AUTHOR_CHANGE_BORN = gql`
  mutation changeBornYear($name: String!, $born: Int!) {
    editAuthor(name: $name, born: $setBornTo) {
      name
      born
      id
      bookCount
    }
  }
`

/*


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
      authors.filter((author) =>
        author.name !== name ? author : updatedAuthor
      )
      return updatedAuthor
    }
  }
}




*/
