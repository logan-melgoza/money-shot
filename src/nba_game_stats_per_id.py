import requests 
from pymongo import MongoClient
from pymongo.server_api import ServerApi
import schedule 
import time





url = "https://api-nba-v1.p.rapidapi.com/"
connection_string = "mongodb+srv://aryanvashishta78:AvuwVjAGAT2LCAyP@cluster1.xplu3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1"
Mongo_database = "NBA_Statistics"
Mongo_collection = "NBA_GameStatsPerID"
Mongo_collection2 = "NBA_Games"
headers = {
	"x-rapidapi-key": "8ad391f451mshf0bfbf49e83471ap1657a5jsnd03326d684b5",
	"x-rapidapi-host": "api-nba-v1.p.rapidapi.com"
}

client = MongoClient(connection_string, server_api=ServerApi('1'))
try:
    database = client[Mongo_database]
    collection = database[Mongo_collection]
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

def collect_data(params={}):
    endpoint_url = f'{url}games/statistics'
    try:
        response = requests.get(endpoint_url, headers=headers, params=params)
        print("API Response:", response.json())  
        if response.status_code == 200:
            data = response.json()
            standings = data.get('response', [])
            print(f"Fetched {len(standings)} game stats from the API.")
            return standings
        else:
            print(f"API request failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return []
    except Exception as e:
        print(f"Error fetching data from API: {e}")
        return []

def insert_data_into_mongodb(data):
    if data:
        try:
            collection.insert_many(data)
        except Exception as e:
            print(f"Error inserting data into MongoDB: {e}")
    else:
        print("No data to insert.") 

def get_gameID():
    game_IDs = [] 
    for game in collection2.find({}, {"id": 1}):  
        game_IDs.append(game["id"])

    client.close()
    return game_IDs 

def main():
    gameIDs = get_gameID()
    length = len(gameIDs)
    for i in range(0,length):
        query_params = {'id': gameIDs[i]}
        gameStat_data = collect_data(query_params)
        insert_data_into_mongodb(gameStat_data)



if __name__ == "__main__":
    main()