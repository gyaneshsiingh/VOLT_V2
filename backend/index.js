const express = require('express');
const cors = require("cors");
const neo4j = require("neo4j-driver");
const {v4: uuidv4} = require("uuid");


const app = express();
app.use(express.json());
app.use(cors());

const driver = neo4j.driver(
    "neo4j+s://e1115464.databases.neo4j.io",
    neo4j.auth.basic("neo4j","fag9PBrhQhoKeV1e4zq_8ACpvqZu8jbPYmHo3f96Zn4")
)



app.post("/station", async (req ,res) => {
    const { stationName, latitude, longitude, charger } = req.body;

    if (!stationName || !latitude || !longitude || !charger) {
        return res.status(400).json({error: "Missing required fields"});
    }
    const {chargingRate, price} = charger;
    const id = uuidv4();

    const session = driver.session();

    try {
        await session.writeTransaction(tx => {
            return tx.run(
                `
                CREATE (s:Station {
                id: $id,
                stationName: $stationName,
                latitude: $latitude,
                longitude: $longitude
                })
                CREATE (c:Charger {
                chargingRate: $chargingRate,
                price: $price
                })
                CREATE (s)-[:HAS_CHARGER]->(c)
                `,
                { id, stationName, latitude, longitude, chargingRate, price }
            )
        });

        await session.writeTransaction(tx => {
            return tx.run(
                `
                MATCH (a:Station {id: $id})
                MATCH (b:Station)
                WHERE a.id <> b.id
                WITH a, b,
                     point({latitude: toFloat(a.latitude),longitude: toFloat(a.longitude)}) AS p1,
                     point({latitude: toFloat(b.latitude),longitude: toFloat(b.longitude)}) AS p2,
                     distance(p1,p2) / 1000 AS distInKm
                WHERE distInKm <= 10
                MERGE (a)-[r1:CONNECTED_TO]->(b)
                SET r1.distance = distInKm
                MERGE (b)-[r2:CONNECTED_TO]->(a)
                SET r2.distance =  distInKm;
                `
             )
        });

        res.status(201).json({ message: "Station added" ,id});
    } catch(err) {
        console.error(err);
        res.status(500).json({error: "neo4j error"});
    }
})


app.get("/station",async(req, res) => {
    const session = driver.session();
    try {
        const result  = await session.readTransaction(tx => {
            return tx.run( `
                MATCH (s:Station)-[:HAS_CHARGER]->(c:Charger)
                RETURN s, c
                `)
        });

        const stations = result.records.map(record => {
            const s = record.get("s").properties;
            const c = record.get("c").properties;
            return {
                id: s.id,
                stationName: s.stationName,
                latitude: s.latitude,
                longitude: s.longitude,
                charger: {
                    chargingRate: c.chargingRate,
                    price: c.price
                }
            };
        });
        res.json(stations);
    } catch(err) {
        console.error(err);
        res.status(500).json({error: "Neo4j read error"});
    }finally {
        await session.close();
    }
});

app.post("/shortest-path",async(req, res) => {
    const {sourceId, destinationId} = req.body;

    if (!sourceId || !destinationId) {
        return res.status(400).json({error: "Missing source or destination"});
    }

    const session = driver.session();

    try {
        const result = await session.run(`
             MATCH (source:Station {id: $sourceId}), (target:Station {id: $destinationId})
             WITH id(source) AS sourceNodeId, id(target) AS targetNodeId
             CALL gds.shortestPath.dijkstra.stream({
             sourceNode: sourceNodeId,
             targetNode: targetNodeId,
             relationshipWeightProperty: 'distance',
             nodeProjection: 'Station',
             relationshipProjection: {
                CONNECTED_TO: {
                type: 'CONNECTED_TO',
                properties: 'distance',
                orientation: 'NATURAL'
                }
              }
        })
             YIELD totalCost, nodeIds
             RETURN totalCost, nodeIds
            `, { sourceId, destinationId }
        );

            if (!result.records.length) {
                return res.status(404).json({error: "No path found between station"})
            }

            const record = result.records[0];
            const totalDistance = record.get("totalCost");
            const nodeIds = record.get("nodeIds");


            const stationResult = await session.run(`
                  MATCH (s:Station)
                  WHERE id(s) IN $nodeIds
                  RETURN s
                `,{ nodeIds });
            
                const stations = stationResult.records.map((r) => r.get("s").properties);

                res.json({totalDistance, path: stations });
    } catch(err) {
        console.error("Dijkstra error:",err);
        res.status(500).json({error: "Neo4j pathfinding failed"});
    }finally {
        await session.close();
    }
});


app.post("/nearby-stations", async (req, res) => {
    const { latitude, longitude, radiusKm } = req.body;

    if (!latitude || !longitude || !radiusKm) {
        return res.status(400).json({error: "Missing required fields"});
    }
    const session = driver.session();
    try {
        const result = await session.run(`
            MATCH (s:Station)
            WHERE point.distance(
                point({latitude: toFloat(s.latitude) ,longitude: toFloat(s.longitude),crs: 'wgs-84'}),
                point({latitude: $latitude, longitude: $longitude})
            ) <= $radiusMeters
             RETURN s
            `, {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                radiusMeters: radiusKm * 1000,
            });

            const stations = result.records.map(r => r.get("s").properties);
            res.json(stations);
    } catch(err) {
        console.error(err);
        res.status(500).json({error: "Neo4j error fetching nearby station"});
    } finally {
        await session.close();
    }
});

const PORT = 3023;

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});
