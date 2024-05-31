const express = require('express')
const path = require('path')

const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const dbPath = path.join(__dirname, 'moviesData.db')
let db = null
const intilizeDatabaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log(`Server Running at http://localhost:3000`)
    })
  } catch (e) {
    console.log(`Db Error ${e.message}`)
    process.exit(1)
  }
}

intilizeDatabaseAndServer()
const convertDbObjectToResponseObject = dbObject => {
  return {
    movieName: dbObject.movie_name,
  }
}
//1)get movies
app.get('/movies/', async (request, response) => {
  const getMovies = `
SELECT movie_name
FROM movie;`
  const result = await db.all(getMovies)
  response.send(
    result.map(eachArray => convertDbObjectToResponseObject(eachArray)),
  )
})
//2)posting of movies
app.post('/movies', async (request, response) => {
  const getDetails = request.body
  const {directorId, movieName, leadActor} = getDetails
  const creatingMovie = `
  INSERT INTO movie(director_id,movie_name,lead_actor)
  VALUES (${directorId},${movieName},${leadActor})`
  const result = await db.run(creatingMovie)
  response.send('Movie Successfully Added')
})
//3)getting of movie
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
SELECT*
FROM movie
where movieId=${movieId}
`
  const result = await db.run(getMovieQuery)
  const {movie_id, director_id, movie_name, lead_actor} = result
  const dbResponse = {
    movieId: movie_id,
    directorId: director_id,
    movieName: movie_name,
    leadActor: lead_actor,
  }
  response.send(dbResponse)
})
//4)updating of movie
app.put('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const getBody = request.body
  const {directorId, movieName, leadActor} = getBody
  const getMovieQuery = `
   update movie
   SET
   director_id:${directorId},
   movie_name:${movieName},
   lead_actor:${leadActor}
   where movie_id=${movieId}
  `
  const result = await db.all(getMovieQuery)
  response.send(result)
})
//5)deleting the movie
app.delete('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const deleteQuery = `
    delete from movie
    where movieId=${movieId}
  `
  const result = await db.run(deleteQuery)
  response.send('Movie Removed')
})
//6)getting the directors
const convertDbObjectToResponseObjects = dbObject => {
  return {
    directorName: dbObject.director_name,
    directorId: dbObject.director_id,
  }
}
app.get('/directors/', async (request, response) => {
  const getDirectorQuery = `
  select*
  from director;
  `
  const result = await db.all(getDirectorQuery)
  response.send(
    response.send(
      result.map(eachArray => convertDbObjectToResponseObjects(eachArray)),
    ),
  )
})
//7) getting the movie names
app.get('/directors/:directorId/movies/', async (request, response) => {
  const getMovies = `
SELECT director_name
FROM director;`
  const result = await db.all(getMovies)
  response.send(result)
})
module.exports = app
