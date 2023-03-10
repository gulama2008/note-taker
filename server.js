const express = require('express');
const fs = require('fs');
const util = require('util');
var uniqid = require("uniqid");
const path = require('path');
const data = require('./db/db.json');
const e = require('express');

const readFromFile = util.promisify(fs.readFile);
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/notes', (req,res) => { 
    res.sendFile(path.join(__dirname, "public/notes.html"));
})

app.get("/api/notes", (req, res) => {
  // Log our request to the terminal
  console.info(`${req.method} request received to get notes`);
  // Sending all notes to the client
  readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)))
})

app.post("/api/notes", (req, res) => {
  const { title, text } = req.body;

  // If all the required properties are present
  if (title && text) {
    // Variable for the object we will save
    const newNote = {
      "title":title,
      "text":text,
      "id": uniqid(),
    };

    // Obtain existing notes
    fs.readFile('./db/db.json', "utf8", (err, data) => {
      if (err) {
        console.error(err);
      } else {
        // Convert string into JSON object
        const parsedNotes = JSON.parse(data);

        // Add a new note
        parsedNotes.push(newNote);

        // Write updated notes back to the file
        fs.writeFile(
          "./db/db.json",
          JSON.stringify(parsedNotes, null, 4),
          (writeErr) =>
            writeErr
              ? console.error(writeErr)
              : console.info("Successfully updated notes!")
        );
      }
    });

    const response = {
      status: "success",
      body: newNote,
    };

    console.log(response);
    res.status(201).json(response);
  } else {
    res.status(500).json("Error in posting note");
  }
});

app.delete('/api/notes/:id', (req,res) => { 
  const deleteId = req.params.id;
  readFromFile("./db/db.json")
    .then((data) => JSON.parse(data))
    .then((data) => { 
      const deleteIndex = data.findIndex(e => (e.id === deleteId));
      data.splice(deleteIndex, 1);
      fs.writeFile(
        "./db/db.json",
        JSON.stringify(data, null, 4),
        (writeErr) =>
          writeErr
            ? console.error(writeErr)
            : console.info("Successfully deleted notes!")
      );
      res.json(data);
    });
})

app.get('*', (req,res) => { 
    res.sendFile(path.join(__dirname, "public/index.html"));
})

app.listen(port, () =>
  console.log(`Start listening at http://localhost:${port}`)
);
