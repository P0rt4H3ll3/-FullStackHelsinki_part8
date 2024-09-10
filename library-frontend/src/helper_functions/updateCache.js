export const updateCache = (cache, query, addedBook) => {
  console.log('Updating cache with:', addedBook)
  const uniqueByTitle = (books) => {
    let seen = new Set()
    return books.filter((book) => {
      let title = book.title
      return seen.has(title) ? false : seen.add(title)
    })
  }
  cache.updateQuery({ query }, ({ allBooks }) => {
    console.log('Current cache:', allBooks)
    return {
      allBooks: uniqueByTitle(allBooks.concat(addedBook))
    }
  })
}
