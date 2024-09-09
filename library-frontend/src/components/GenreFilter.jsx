const GenreFilter = ({ genres, setFilter }) => {
  return (
    <div>
      <h3>filter by Genre: </h3>
      <div>
        {genres.map((genre) => {
          return (
            <button key={genre} onClick={() => setFilter(genre)}>
              {genre}
            </button>
          )
        })}
      </div>
      <div>
        <button onClick={() => setFilter('')}>show all</button>
      </div>
    </div>
  )
}
export default GenreFilter
