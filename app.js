const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server is running at http://localhost:3000/`);
    });
  } catch (e) {
    console.log(`DB Error : ${e}`);
    process.exit(1);
  }
};
initializeDBAndServer();

convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

convertDbObjectToResponseObject2 = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//get movies list
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT movie_name FROM movie;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

//create a movie using post method
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `INSERT INTO movie (director_id,movie_name,lead_actor) 
    VALUES (${directorId},'${movieName}','${leadActor}');`;
  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//get player detail
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id=${movieId};`;
  const movieDetail = await db.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(movieDetail));
});

//update movie details
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `UPDATE movie SET
    "director_id"=${directorId},
    "movie_name"='${movieName}',
    "lead_actor"='${leadActor}'
    WHERE movie_id=${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//delete movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id=${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//get director details
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `SELECT * FROM director;`;
  const directorsArray = await db.all(getDirectorQuery);
  response.send(
    directorsArray.map((eachDirector) =>
      convertDbObjectToResponseObject2(eachDirector)
    )
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `SELECT movie_name FROM movie WHERE director_id=${directorId};`;
  const directorMovies = await db.all(getDirectorMoviesQuery);
  response.send(
    directorMovies.map((eachMovie) =>
      convertDbObjectToResponseObject(eachMovie)
    )
  );
});

module.exports = app;
