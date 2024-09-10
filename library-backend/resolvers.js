const { GraphQLError } = require('graphql')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
const jwt = require('jsonwebtoken')

const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allAuthors: async () => {
      const authors = await Author.find({})
      const books = await Book.find({}).populate('author')
      return authors.map((author) => ({
        name: author.name,
        bookCount: books.filter((book) => book.author.name === author.name)
          .length,
        born: author.born,
        id: author._id
      }))
    },
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
        const populatedBook = await Book.findById(book._id).populate('author')

        pubsub.publish('BOOK_ADDED', { bookAdded: populatedBook })
        return populatedBook
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
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
      // in addBook Mutation => pubsub.publish('BOOK_ADDED', {bookAdded: book })
    }
  }
}

module.exports = resolvers
