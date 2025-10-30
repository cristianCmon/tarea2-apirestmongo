const express = require('express')
const app = express()
const puerto = 3000

app.use(express.json()); // permite aceptar jsones en body
app.use(express.urlencoded({extended: true}));

const { MongoClient, ServerApiVersion } = require("mongodb");
const mongo = require("mongodb"); // necesario para generar correctamente ObjectId
const uriLocal = "mongodb://localhost:27017/";
const uri = uriLocal;
//const uri = 'mongodb+srv://root:root@cluster0.m6rrr28.mongodb.net/';


// https://www.mongodb.com/docs/drivers/node/current/connect/mongoclient/
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    // Envía ping para confirmar conexión satisfactoria
    await client.db("admin").command({ ping: 1 });
    console.log("Conectado a MongoDB...\n");

  } finally {
    await client.close();
  }
}

run().catch(console.dir);

app.listen(puerto, () => {
  console.log(`\nAPI REST escuchando en puerto ${puerto}...`);
});


// APIS
app.post('/comandas', async (req, res) => {
  realizarConsultaBD(req, res, "CREAR", "comandas");
});

app.get('/menus', async (req, res) => {
  realizarConsultaBD(req, res, "LEER", "menus");
});

app.get('/menus/:id', async (req, res) => {
  realizarConsultaBD(req, res, "LEER", "menus");
});

app.get('/mesas', async (req, res) => {
  realizarConsultaBD(req, res, "LEER", "mesas");
});

app.put('/mesas/:id', async (req, res) => {
  realizarConsultaBD(req, res, "ACTUALIZAR", "mesas");
});

// app.delete('/jugadores/borrar/:id', async (req, res) => {
//   realizarConsultaBD(req, res, "BORRAR");
// });




//CONSULTAS
async function realizarConsultaBD(req, res, tipoConsulta, coleccionBD) {
  try {
    let result, id, body;

    const conexion = await client.connect();
    const baseDatos = conexion.db('cafeteria');
    const coleccion = baseDatos.collection(coleccionBD);
    
    switch (tipoConsulta) {
        
      case "CREAR":
        body = req.body;

        result = await coleccion.insertOne(body);
        res.status(200).json({ message: "Registro CREADO CORRECTAMENTE - id: " + result.insertedId });

        break;

      case "LEER":
        id = req.params;

        if (JSON.stringify(id) === "{}") {
          result = await coleccion.find().toArray();
        } else {
          //result = await coleccion.find({_id: new mongo.ObjectId(id)}).toArray();
          result = await coleccion.findOne({_id: new mongo.ObjectId(id)});
        }

        res.send(result);

        break;

      case "ACTUALIZAR":
        id = req.params.id;
        body = req.body;

        result = await coleccion.updateOne({ _id: new mongo.ObjectId(id) }, {$set:body});
        res.status(200).json({ message: "Registro ACTUALIZADO CORRECTAMENTE" });

        break;
/*
      case "BORRAR":
        id = req.params.id;

        result = await coleccion.deleteOne({ _id: new mongo.ObjectId(id) });
        res.status(200).json({ message: "Registro BORRADO CORRECTAMENTE" });

        break;
        */
    }

  } catch (err) {
    res.status(400).json({ message: "ERROR - No se encontraron documentos que coincidan con la consulta" });
    console.log(err);
    
  } finally {
    await client.close();
  }
}


