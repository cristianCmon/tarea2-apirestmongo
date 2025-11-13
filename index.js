const express = require('express')
const app = express()
const puerto = 3000

app.use(express.json()); // permite aceptar jsones en body
app.use(express.urlencoded({extended: true}));

const { MongoClient, ServerApiVersion } = require("mongodb");
const mongo = require("mongodb"); // necesario para generar correctamente ObjectId
//const uri = 'mongodb+srv://root:root@cluster0.m6rrr28.mongodb.net/';
const uriLocal = "mongodb://localhost:27017/";
const uri = uriLocal;


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
  console.log(`\nAPI-REST RESTAURANTE escuchando en puerto ${puerto}...`);
});


// APIS
app.post('/comandas', async (req, res) => {
  realizarConsultaBD(req, res, "CREAR", "comandas");
});

app.get('/comandas/:id', async (req, res) => {
  realizarConsultaBD(req, res, "LEER", "comandas");
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

app.get('/mesas/:id', async (req, res) => {
  realizarConsultaBD(req, res, "LEER", "mesas");
});

app.put('/comandas/:id', async (req, res) => {
  realizarConsultaBD(req, res, "ACTUALIZAR", "comandas");
});

app.put('/mesas/:id', async (req, res) => {
  realizarConsultaBD(req, res, "ACTUALIZAR", "mesas");
});


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

        result = await coleccion.insertOne({body}); // Array de objetos
        // console.log(result);
        // console.log(result.insertedId);
       
        // Esta respuesta (id de comanda recién creada) sobreescribirá el campo _id del modelo java
        res.send({"_id" : result.insertedId.toString()});

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
    }

  } catch (err) {
    res.status(400).json({ message: "ERROR - No se encontraron documentos que coincidan con la consulta" });
    console.log(err);
    
  } finally {
    await client.close();
  }
}
