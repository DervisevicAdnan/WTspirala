const express = require('express');
const session = require("express-session");
const path = require('path');
const fs = require('fs').promises; // Using asynchronus API for file read and write
const bcrypt = require('bcrypt');

const sequelize = require('./public/Scripts/baza');
const { where } = require('sequelize');
const Korisnik = require('./public/Scripts/korisnik')(sequelize);
const Nekretnina = require('./public/Scripts/nekretninaModel')(sequelize);
const Upit = require('./public/Scripts/upitModel')(sequelize);
const Zahtjev = require('./public/Scripts/zahtjevModel')(sequelize);
const Ponuda = require('./public/Scripts/ponudaModel')(sequelize);

const app = express();
const PORT = 3000;

//console.log(bcrypt.hashSync("12345678",bcrypt.genSaltSync()));
const rateLimit = {};

function datumNakonDanasnjeg(datumString) {
  const dijelovi = datumString.split(".");
  if (dijelovi.length !== 3) {
    return false;
  }

  const dan = parseInt(dijelovi[0], 10);
  const mjesec = parseInt(dijelovi[1], 10) - 1;
  const godina = parseInt(dijelovi[2], 10);

  
  if (isNaN(dan) || isNaN(mjesec) || isNaN(godina)) {
    return false;
  }

  const datum = new Date(godina, mjesec, dan);
  const danas = new Date();
  danas.setHours(0, 0, 0, 0);
  return datum >= danas;
}


app.use(session({
  secret: 'tajna sifra',
  resave: true,
  saveUninitialized: true
}));

app.use(express.static(__dirname + '/public'));

// Enable JSON parsing without body-parser
app.use(express.json());

/* ---------------- SERVING HTML -------------------- */

// Async function for serving html files
async function serveHTMLFile(req, res, fileName) {
  const htmlPath = path.join(__dirname, 'public/html', fileName);
  try {
    const content = await fs.readFile(htmlPath, 'utf-8');
    res.send(content);
  } catch (error) {
    console.error('Error serving HTML file:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
}

// Array of HTML files and their routes
const routes = [
  { route: '/nekretnine.html', file: 'nekretnine.html' },
  { route: '/detalji.html', file: 'detalji.html' },
  { route: '/meni.html', file: 'meni.html' },
  { route: '/prijava.html', file: 'prijava.html' },
  { route: '/profil.html', file: 'profil.html' },
  { route: '/mojiupiti.html', file: 'mojiUpiti.html' },
  // Practical for adding more .html files as the project grows
];

// Loop through the array so HTML can be served
routes.forEach(({ route, file }) => {
  app.get(route, async (req, res) => {
    await serveHTMLFile(req, res, file);
  });
});

/* ----------- SERVING OTHER ROUTES --------------- */

// Async function for reading json data from data folder 
async function readJsonFile(filename) {
  const filePath = path.join(__dirname, 'data', `${filename}.json`);
  try {
    const rawdata = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(rawdata);
  } catch (error) {
    throw error;
  }
}

// Async function for reading json data from data folder 
async function saveJsonFile(filename, data) {
  const filePath = path.join(__dirname, 'data', `${filename}.json`);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    throw error;
  }
}


sequelize.sync({ alter: true }).then(() => {
  console.log('Baza podataka sinhronizirana!');
});


/*
Checks if the user exists and if the password is correct based on korisnici.json data. 
If the data is correct, the username is saved in the session and a success message is sent.
*/
app.post('/login', async (req, res) => {
  const now = Date.now();
  const jsonObj = req.body;
  const logFilePath = path.join(__dirname, 'data', 'prijave.txt');

  try {

    if (!rateLimit[jsonObj.username]) {
      rateLimit[jsonObj.username] = { attempts: 0, lastAttempt: 0, blockedUntil: 0 };
    }
    const userRate = rateLimit[jsonObj.username];

    if (userRate.blockedUntil > now) {
      const waitTime = Math.ceil((userRate.blockedUntil - now) / 1000);
      await fs.appendFile(logFilePath, `[${new Date().toISOString()}] - username: "${jsonObj.username}" - status: "neuspješno"\n`);
      return res.status(429).json({ greska: `Previse neuspjesnih pokusaja. Pokusajte ponovo za ` + waitTime + ' s.' });
    }

    let found = false;

    let korisnik = await Korisnik.findOne({
      where: {
        username: jsonObj.username
      }
    });

    if (korisnik) {
      //korisnik = korisnik.dataValues;
      // console.log(korisnik);
      const isPasswordMatched = await bcrypt.compare(jsonObj.password, korisnik.password);
      if (isPasswordMatched) {
        req.session.username = korisnik.username;
        found = true;
      }
    }

    if (found) {
      res.json({ poruka: 'Uspješna prijava' });
      userRate.attempts = 0;
      //let tmp = new Date();
      //await fs.appendFile(logFilePath, `[${tmp.getDate()}.${tmp.getMonth()}.${tmp.getFullYear()}_${tmp.getHours()}:${tmp.getMinutes()}:${tmp.getSeconds()}] - username: "${jsonObj.username}" - status: "uspješno"\n`);
      await fs.appendFile(logFilePath, `[${new Date().toISOString()}] - username: "${jsonObj.username}" - status: "uspješno"\n`);
    } else {
      userRate.attempts += 1;
      userRate.lastAttempt = now;
      await fs.appendFile(logFilePath, `[${new Date().toISOString()}] - username: "${jsonObj.username}" - status: "neuspješno"\n`);


      if (userRate.attempts >= 3) {
        userRate.attempts = 0;
        userRate.blockedUntil = now + 60000;
        return res.status(429).json({ greska: 'Previse neuspjesnih pokusaja. Pokusajte ponovo za 1 minutu.' });
      }
      res.json({ poruka: 'Neuspješna prijava' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

/*
Delete everything from the session.
*/
app.post('/logout', (req, res) => {
  // Check if the user is authenticated
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // Clear all information from the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
      res.status(500).json({ greska: 'Internal Server Error' });
    } else {
      res.status(200).json({ poruka: 'Uspješno ste se odjavili' });
    }
  });
});

/*
Returns currently logged user data. First takes the username from the session and grabs other data
from the .json file.
*/
app.get('/korisnik', async (req, res) => {
  // Check if the username is present in the session
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // User is logged in, fetch additional user data
  const username = req.session.username;

  try {

    let user = await Korisnik.findOne({
      where: {
        username: username
      }
    });

    if (!user) {
      // User not found (should not happen if users are correctly managed)
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    // Send user data
    const userData = {
      id: user.id,
      ime: user.ime,
      prezime: user.prezime,
      username: user.username,
      password: user.password // Should exclude the password for security reasons
    };

    res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.get('/idusernames', async (req, res) => {
  try {
    const users = await Korisnik.findAll({
      attributes: [
        'id',
        'username'
      ]
    });

    const idUsernamesMap = {};
    users.forEach(user => {
      idUsernamesMap[user.id] = user.username;
    });

    res.status(200).json(idUsernamesMap);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

/*
Allows logged user to make a request for a property
*/
app.post('/upit', async (req, res) => {
  // Check if the user is authenticated
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // Get data from the request body
  const { nekretnina_id, tekst_upita } = req.body;

  try {

    // Read user data from the JSON file
    // const users = await readJsonFile('korisnici');

    // Read properties data from the JSON file
    const nekretnine = await readJsonFile('nekretnine');

    // Find the user by username
    // const loggedInUser = users.find((user) => user.username === req.session.username);
    const loggedInUser = await Korisnik.findOne({
      where: {
        username: req.session.username
      }
    });

    // Check if the property with nekretnina_id exists
    // const nekretnina = nekretnine.find((property) => property.id === nekretnina_id);
    const nekretnina = await Nekretnina.findOne({
      where: {
        id: nekretnina_id
      }
    })


    if (!nekretnina) {
      // Property not found
      return res.status(400).json({ greska: `Nekretnina sa id-em ${nekretnina_id} ne postoji` });
    }

    const korisnikNekUpiti = await Upit.findAll({
      where: {
        korisnikId: loggedInUser.id,
        nekretninaId: nekretnina.id
      }
    });

    // console.log(korisnikNekUpiti);
    const cistiUpiti = korisnikNekUpiti.map(upit => upit.dataValues);
    // console.log(cistiUpiti);

    let count = cistiUpiti.length;
    if (count >= 3) {
      return res.status(429).json({ greska: "Previse upita za istu nekretninu." });
    }

    await Upit.create({
      korisnikId: loggedInUser.id,
      nekretninaId: nekretnina.id,
      tekst: tekst_upita
    });

    res.status(200).json({ poruka: 'Upit je uspješno dodan' });
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.get('/upiti/moji', async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }
  const mojiUpiti = [];
  try {

    const loggedInUser = await Korisnik.findOne({
      where: {
        username: req.session.username
      }
    });

    if (!loggedInUser) {
      return res.status(404).json({ greska: 'Korisnik nije pronađen' });
    }


    // Find all upiti associated with the user
    const upiti = await Upit.findAll({
      attributes: [
        'nekretninaId',
        'tekst'
      ],
      where: {
        korisnikId: loggedInUser.id,
      }
    });

    const cistiUpiti = upiti.map(upit => ({
      id_nekretnine: upit.nekretninaId,
      tekst_upita: upit.tekst
    }))

    if (cistiUpiti.length === 0) {
      return res.status(404).json(cistiUpiti);
    }

    res.status(200).json(cistiUpiti);

  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

/*
Updates any user field
*/
app.put('/korisnik', async (req, res) => {
  // Check if the user is authenticated
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // Get data from the request body
  const { ime, prezime, username, password } = req.body;

  try {

    let loggedInUser = {};
    // // Update user data with the provided values
    if (ime) loggedInUser.ime = ime;
    if (prezime) loggedInUser.prezime = prezime;
    if (username) loggedInUser.username = username;
    if (password) {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      loggedInUser.password = hashedPassword;
    }

    const rez = await Korisnik.update(
      loggedInUser,
      {
        where: {
          username: req.session.username
        }
      }
    );

    if (!rez) {
      return res.status(500).json({ greska: 'Internal Server Error' });
    }

    res.status(200).json({ poruka: 'Podaci su uspješno ažurirani' });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

// async function nesto() {
//   const nekretnineData = await readJsonFile('nekretnine');

//   for (let nek of nekretnineData) {
//     const nekretnina = await Nekretnina.create({
//       tip_nekretnine: nek.tip_nekretnine,
//       naziv: nek.naziv,
//       kvadratura: nek.kvadratura,
//       cijena: nek.cijena,
//       tip_grijanja: nek.tip_grijanja,
//       lokacija: nek.lokacija,
//       godina_izgradnje: nek.godina_izgradnje,
//       datum_objave: nek.datum_objave,
//       opis: nek.opis
//     });

//     for (let upit of nek.upiti) {
//       console.log("NEKRETNINA ID :", nekretnina.id);
//       console.log(nekretnina);
//       console.log(upit);
//       await Upit.create({
//         korisnikId: upit.korisnik_id,
//         nekretninaId: nekretnina.id,
//         tekst: upit.tekst_upita,
//       });
//     }
//   }
// }


/*
Returns all properties from the file.
*/
app.get('/nekretnine', async (req, res) => {
  try {
    // const nekretnineData = await readJsonFile('nekretnine');
    // res.json(nekretnineData);

    let nekretnine = await Nekretnina.findAll();
    nekretnine = nekretnine.map(nek => nek.dataValues);

    for (let nek of nekretnine) {
      let upiti = await Upit.findAll({
        where: {
          "nekretninaId": nek.id
        }
      });
      upiti = upiti.map(upit => upit.dataValues);
      nek.upiti = upiti;
    }

    res.json(nekretnine);

  } catch (error) {
    console.error('Error fetching properties data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.get('/nekretnine/top5', async (req, res) => {

  try {
    const lokacija = req.query.lokacija;
    // console.log("Lokacijaaa: "+lokacija);
    // console.log("Ima li sta");

    let nekretnineData = await Nekretnina.findAll();
    nekretnineData = nekretnineData.map(nek => nek.dataValues);

    for (let nek of nekretnineData) {
      let upiti = await Upit.findAll({
        where: {
          "nekretninaId": nek.id
        }
      });
      upiti = upiti.map(upit => upit.dataValues);
      nek.upiti = upiti;
    }

    nekretnineData = nekretnineData.filter((nekretnina) => { return nekretnina.lokacija.toLowerCase() === lokacija.toLowerCase() });
    nekretnineData = nekretnineData.sort((nekretnina1, nekretnina2) => {
      let [day, month, year] = nekretnina1.datum_objave.slice(0, -1).split(".").map(Number);
      const date1 = new Date(year, month - 1, day);
      [day, month, year] = nekretnina2.datum_objave.slice(0, -1).split(".").map(Number);
      const date2 = new Date(year, month - 1, day);
      // console.log("date1", date1.toString());
      // console.log("date2", date2.toString());
      return date2 - date1;
    });

    if (nekretnineData.length > 5) {
      nekretnineData = nekretnineData.slice(0, 5);
    }

    res.json(nekretnineData);
  } catch (error) {
    console.error('Error fetching properties data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.get('/nekretnina/:id', async (req, res) => {
  let id = req.params.id;
  try {
    id = parseInt(id);
    // const nekretnineData = await readJsonFile('nekretnine');
    // let nekretnina = nekretnineData.find((nekret) => nekret.id === id);

    let nekretnina = await Nekretnina.findOne({
      where: {
        "id": id
      }
    });

    if (!nekretnina) {
      return res.status(404).json({});
    }

    nekretnina = nekretnina.dataValues;

    let upiti = await Upit.findAll({
      where: {
        "nekretninaId": id
      }
    });

    upiti = upiti.map(upit => upit.dataValues);

    let brUpita = upiti.length
    if (brUpita > 3) {
      upiti = upiti.slice(- 3);
    }

    nekretnina.upiti = upiti;

    res.status(200).json(nekretnina);
  } catch (error) {
    console.error('Error fetching properties data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.get('/next/upiti/nekretnina:id', async (req, res) => {
  let id = req.params.id;
  try {
    id = parseInt(id);
    let page = parseInt(req.query.page);

    let upiti = await Upit.findAll({
      where: {
        "nekretninaId": id
      }
    });

    upiti = upiti.map(upit => upit.dataValues);

    if (page < 0) {
      return res.status(404).json([]);
    }

    let brUpita = upiti.length

    let upitOd = brUpita - ((page + 1) * 3);
    let upitDo = brUpita - (page * 3);

    // console.log(brUpita);
    // console.log(upitOd,"-",upitDo);

    if (upitDo <= 0) {
      return res.status(404).json([]);
    } else if (upitOd < 0) {
      upitOd = 0;
    }

    return res.status(200).json(upiti.slice(upitOd, upitDo));

  } catch (error) {
    console.error('Error fetching properties data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

/* ----------------- MARKETING ROUTES ----------------- */

// Route that increments value of pretrage for one based on list of ids in nizNekretnina
app.post('/marketing/nekretnine', async (req, res) => {
  const { nizNekretnina } = req.body;

  try {
    // Load JSON data
    let preferencije = await readJsonFile('preferencije');

    // Check format
    if (!preferencije || !Array.isArray(preferencije)) {
      console.error('Neispravan format podataka u preferencije.json.');
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Init object for search
    preferencije = preferencije.map((nekretnina) => {
      nekretnina.pretrage = nekretnina.pretrage || 0;
      return nekretnina;
    });

    // Update atribute pretraga
    nizNekretnina.forEach((id) => {
      const nekretnina = preferencije.find((item) => item.id === id);
      if (nekretnina) {
        nekretnina.pretrage += 1;
      }
    });

    // Save JSON file
    await saveJsonFile('preferencije', preferencije);

    res.status(200).json({});
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/nekretnina/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const nekretninaData = preferencije.find((item) => item.id === parseInt(id, 10));

    if (nekretninaData) {
      // Update clicks
      nekretninaData.klikovi = (nekretninaData.klikovi || 0) + 1;

      // Save JSON file
      await saveJsonFile('preferencije', preferencije);

      res.status(200).json({ success: true, message: 'Broj klikova ažuriran.' });
    } else {
      res.status(404).json({ error: 'Nekretnina nije pronađena.' });
    }
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/osvjezi/pretrage', async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, pretrage: nekretninaData ? nekretninaData.pretrage : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/osvjezi/klikovi', async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, klikovi: nekretninaData ? nekretninaData.klikovi : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/nekretnina/:id/interesovanja', async (req, res) => {
  try {
    let id = req.params.id;

    let upiti = await Upit.findAll({
      where: {
        "nekretninaId": id
      }
    });
    upiti = upiti.map(upit => upit.dataValues);

    let zahtjevi = await Zahtjev.findAll({
      where: {
        "nekretninaId": id
      }
    });
    zahtjevi = zahtjevi.map(zahtjev => zahtjev.dataValues);

    let ponude = await Ponuda.findAll({
      where: {
        "nekretninaId": id
      }
    });

    let loggedInUser = null;
    if (req.session.username) {
      loggedInUser = await Korisnik.findOne({
        where: {
          username: req.session.username
        }
      });

      if (!loggedInUser) {
        return res.status(404).json({ greska: 'Korisnik nije pronađen' });
      }


      if (loggedInUser.admin) {
        ponude = ponude.map(ponuda => ponuda.dataValues);
        return res.status(200).json(upiti.concat(zahtjevi, ponude));
      }
    }

    let novePonude = []

    novePonude = await Promise.all(ponude.map(async (ponuda) => {
      let ponudaTmp = ponuda.dataValues;

      if (!loggedInUser) {
        delete ponudaTmp.cijenaPonude;
      } else {
        let vezane = await ponuda.vezanePonude;
        // console.log(vezane);

        let jestVezana = vezane.some((vez) => {
          return vez.korisnikId == loggedInUser.id;
        });
        // console.log("vezana", jestVezana);
        if (loggedInUser.id != ponudaTmp.korisnikId || jestVezana) {
          delete ponudaTmp.cijenaPonude;
        }
      }
      // console.log("nove", ponudaTmp)
      return ponudaTmp;
    }));

    // console.log("nove na kraju", novePonude);

    res.status(200).json(upiti.concat(zahtjevi, novePonude));

  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.post('/nekretnina/:id/ponuda', async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  try {
    const id = req.params.id;
    const { tekst, ponudaCijene, datumPonude, idVezanePonude, odbijenaPonuda } = req.body;

    const loggedInUser = await Korisnik.findOne({
      where: {
        "username": req.session.username
      }
    });

    console.log(datumPonude);

    if (idVezanePonude) {
      let vezanaPonuda = await Ponuda.findOne({
        where: {
          "id": idVezanePonude
        }
      });
      if (!vezanaPonuda) {
        return res.status(404).json({ greska: "Ponuda sa idVezanePonude ne postoji" });
      }

      // admin moze na sve
      
      let vezane = await vezanaPonuda.vezanePonude;

      // korisnik na vezane
      if (!loggedInUser.admin) {
        let jestVezana = vezane.some((vez) => {
          return vez.korisnikId == loggedInUser.id;
        });
        // console.log("vezana", jestVezana);
        if (loggedInUser.id != vezanaPonuda.korisnikId && !jestVezana) {
          return res.status(404).json({ greska: "Nije moguce vezati na tu ponudu" });
        }
      }

      if(vezane.some((vez) => {
        return vez.odbijenaPonuda;
      })){
        return res.status(404).json({ greska: "Nije moguce vezati na tu ponudu" });
      }
    }



    await Ponuda.create({ 
      korisnikId: loggedInUser.id,
      nekretninaId: id,
      tekst: tekst,
      cijenaPonude: ponudaCijene,
      datumPonude: datumPonude,
      odbijenaPonuda: odbijenaPonuda,
      vezanaPonudaId: idVezanePonude
    });

    res.status(200).json({ poruka: 'Ponuda je uspješno dodana' });

  } catch (error) {
    console.error('Error fetching properties data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

app.post('/nekretnina/:id/zahtjev', async (req, res) => {
  try{
    
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
