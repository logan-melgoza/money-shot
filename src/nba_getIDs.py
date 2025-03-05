from pymongo import MongoClient
from pymongo.server_api import ServerApi

connection_string = "mongodb+srv://aryanvashishta78:AvuwVjAGAT2LCAyP@cluster1.xplu3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1"
Mongo_database = "NBA_Statistics"
Mongo_collection1 = "NBA_Players"
Mongo_collection2 = "NBA_Games"

client = MongoClient(connection_string, server_api=ServerApi('1'))
try:
    database = client[Mongo_database]
    collection = database[Mongo_collection1]
    client.admin.command('ping')
    print(" You successfully connected to MongoDB!")
except Exception as e:
    print(f"MongoDB connection error: {e}") 

client = MongoClient(connection_string, server_api=ServerApi('1'))
try:
    database2 = client[Mongo_database]
    collection2 = database[Mongo_collection2]
    client.admin.command('ping')
    print(" You successfully connected to MongoDB!")
except Exception as e:
    print(f"MongoDB connection error: {e}") 


def get_playerID():
    player_IDs = [] 
    for player in collection.find({}, {"id": 1}):  
        player_IDs.append(player["id"])

    client.close()
    return player_IDs 

def get_gameID():
    game_IDs = []
    for game in collection2.find({},{"id":1}):
        game_IDs.append(game["id"])
    
    client.close()
    return game_IDs

if __name__ == "__main__":
    listPlayerIDs = get_playerID()
    listGameIDs = get_gameID()
    print(listPlayerIDs)
    print(len(listGameIDs))