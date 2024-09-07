const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const mongoose = require('mongoose')
const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')

mongoose.set('strictQuery', false)
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to MONGODB_URI')

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = `
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!  
  }

  type Token {
    value: String!
  }

  type Book {
    title: String!
    author: Author!
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
    me: User
  }
  
  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(
      author: String!, 
      born: Int!
    ) : Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ):Token
  }
  `

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allAuthors: async () => await Author.find({}),
    allBooks: async (root, args) => {
      let query = {}

      if (args.author) {
        const author = await Author.findOne({ name: args.author }) //attempts to find the author in the Author collection
        if (!author) {
          return []
        }
        query.author = author._id
      }
      if (args.genre) {
        query.genres = { $in: [args.genre] } // In MongoDB, the $in operator is used to match any of the values specified in an array. When you query an array field using $in, MongoDB will return documents where at least one of the array elements matches any of the values specified in the $in array.

        //$in is useful when you need to check if a field contains any of the values in an array of potential matche
        //others are $all , $exists, $not
      }

      const books = await Book.find(query).populate('author')
      return books
    },
    me: (root, args, context) => {
      console.log(context.currentUser)
      return context.currentUser
    }
  },
  Author: {
    bookCount: async ({ name }) => {
      // Find the author by name
      const author = await Author.findOne({ name: name })

      // If the author is not found, return 0
      if (!author) {
        return 0
      }

      // Directly find books by author._id
      const books = await Book.find({ author: author._id })

      // Return the count of books
      return books.length
    }
  },
  Mutation: {
    addBook: async (root, args, context) => {
      let author = await Author.findOne({ name: args.author })
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

      if (!author) {
        const newAuthor = new Author({
          name: args.author,
          born: null
        })
        try {
          author = await newAuthor.save()
        } catch (error) {
          throw new GraphQLError(
            'Author of new Book is not known and Adding new Author Failed',
            {
              extensions: {
                code: 'BAD_USER_INPUT',
                invalidArgs: args.author,
                error
              }
            }
          )
        }
      }

      try {
        const book = new Book({ ...args, author: author._id })
        await book.save()
        return await Book.findById(book._id).populate('author')
      } catch (error) {
        throw new GraphQLError('Adding new Book Failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            error
          }
        })
      }
    },
    editAuthor: async (root, args, context) => {
      const author = await Author.findOne({ name: args.author })
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

      if (!author) {
        return null
      }

      author.born = args.born

      try {
        await author.save()
      } catch {
        throw new GraphQLError('Updating year born failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.born,
            error
          }
        })
      }

      return author
    },
    createUser: async (root, { username, favoriteGenre }) => {
      const user = new User({
        username,
        favoriteGenre
      })
      try {
        const result = user.save()
        return result
      } catch (error) {
        throw new GraphQLError('User Creation Failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            error
          }
        })
      }
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      if (!user || args.password !== 'secret') {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }
      const useForToken = {
        username: user.username,
        id: user._id
      }

      return { value: jwt.sign(useForToken, process.env.JWT_SECRET) }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null
    //console.log(req.headers.authorization)
    if (auth && auth.startsWith('Bearer ')) {
      const decodeToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET)
      //console.log(decodeToken)
      // {
      //   "username": "Philley",
      //   "id": "66dc3919f680c6153b778ecb",
      //   "iat": 1725716178
      // } The iat field in the decoded JWT stands for "Issued At" and represents the time when the token was created.
      const currentUser = await User.findById(decodeToken.id) //error was here .id instead of ._id
      //console.log(currentUser)
      return { currentUser }
    }
  }
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})

// inserting all the authors = easy

// Author.insertMany(authors)
//   .then(authorsDocs => {
//     console.log("Authors successfully added:", authorsDocs);

// inserting all the books was hard because books needed the object id ._id from the authors

// const insertAllBooks = async (books) => {
//   for (const book of books) {
//     try {
//       const author = await Author.findOne({ name: book.author })
//       if (!author) {
//         console.log(`Author not found for book: ${book.title}`)
//         continue // Skip this book if author not found
//       }

//       const newBook = new Book({
//         ...book, // Spread the rest of the book properties
//         author: author._id // Set author to ObjectId
//       })

//       const result = await newBook.save()
//       console.log('Saved book:', result)
//     } catch (error) {
//       console.log('Error saving book:', error)
//     }
//   }
// }

// insertAllBooks(books)
