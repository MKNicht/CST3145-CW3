const express = require('express');
const { MongoClient } = require('mongodb');
const router = express.Router();

const uri = "mongodb+srv://wk170:AMhP0sN3vPIwSUnC@cluster0.kgrzjcv.mongodb.net/";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

router.post('/orders', async (req, res) => {
  try {
    await client.connect();
    const database = client.db("CST3145");
    const orders = database.collection("orders");

    const { name, phoneNumber, lessonIDs, totalOfPrice } = req.body;
    const order = { name, phoneNumber, lessonIDs, numberOfSpace: lessonIDs.length, totalOfPrice };

    const result = await orders.insertOne(order);
    if(result.acknowledged) {
      res.status(201).json(result);
    } else {
      throw new Error('Order insertion failed');
    }
  } catch (error) {
    console.error(error); 
    res.status(500).send('Error creating order');
  } finally {
    await client.close();
  }
});

module.exports = router;
