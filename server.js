const express = require('express');
const fs = require('fs');
var uniqid = require("uniqid");
const path = require('path');
const data=require('./db/db.json')
const app = express();
const PORT = 3001;

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
    util.promisify(fs.readFile);
    return res.status(200).json(data);
});

app.post("/api/notes", (req, res) => {
  const { title, text } = req.body;

  // If all the required properties are present
  if (title && text) {
    // Variable for the object we will save
    const newNote = {
      "title":title,
      "text":text,
      "note_id": uniqid(),
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

app.get('*', (req,res) => { 
    res.sendFile(path.join(__dirname, "public/index.html"));
})

app.listen(PORT, () =>
  console.log(`Start listening at http://localhost:${PORT}`)
);
